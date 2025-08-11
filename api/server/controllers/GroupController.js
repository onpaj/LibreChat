const { SystemRoles } = require('librechat-data-provider');
const { 
  getGroups, 
  getGroup, 
  createGroup, 
  updateGroup, 
  deleteGroup 
} = require('~/models');
const { User } = require('~/db/models');
const { logger } = require('@librechat/data-schemas');

/**
 * Get all groups with pagination and filtering
 */
const getGroupsHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      populate: [
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' },
      ],
    };
    
    const result = await getGroups(filter, options);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch groups',
      error: error.message,
    });
  }
};

/**
 * Get single group by ID
 */
const getGroupHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const group = await getGroup({ _id: id }, {
      populate: [
        { path: 'createdBy', select: 'name email' },
        { path: 'updatedBy', select: 'name email' },
      ],
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    logger.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group',
      error: error.message,
    });
  }
};

/**
 * Create new group
 */
const createGroupHandler = async (req, res) => {
  try {
    const { name, description, isActive = true } = req.body;
    const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Use real user ID when available

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    // Check if group name already exists
    const existingGroup = await getGroup({ name: name.trim() });
    if (existingGroup) {
      return res.status(409).json({
        success: false,
        message: 'Group with this name already exists',
      });
    }

    const groupData = {
      name: name.trim(),
      description: description?.trim() || '',
      isActive,
      createdBy: userId,
      timeWindows: [],
      memberCount: 0,
    };

    const newGroup = await createGroup(groupData);
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: newGroup,
    });
  } catch (error) {
    logger.error('Error creating group:', error);
    if (error.message === 'Group with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message,
    });
  }
};

/**
 * Update group
 */
const updateGroupHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const userId = req.user?.id || '507f1f77bcf86cd799439011'; // Use real user ID when available

    // Check if group exists
    const existingGroup = await getGroup({ _id: id });
    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // If updating name, check for uniqueness
    if (name && name.trim() !== existingGroup.name) {
      const duplicateGroup = await getGroup({ name: name.trim() });
      if (duplicateGroup) {
        return res.status(409).json({
          success: false,
          message: 'Group with this name already exists',
        });
      }
    }

    const updateData = {
      updatedBy: userId,
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description.trim();
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updatedGroup = await updateGroup({ _id: id }, updateData);
    
    res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: updatedGroup,
    });
  } catch (error) {
    logger.error('Error updating group:', error);
    if (error.message === 'Group with this name already exists') {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update group',
      error: error.message,
    });
  }
};

/**
 * Delete group
 */
const deleteGroupHandler = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if group exists
    const existingGroup = await getGroup({ _id: id });
    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if group has members
    if (existingGroup.memberCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete group with members. Remove all members first.',
      });
    }

    const deleted = await deleteGroup({ _id: id });
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group',
      error: error.message,
    });
  }
};

/**
 * Get group statistics
 */
const getGroupStatsHandler = async (req, res) => {
  try {
    // Try to get group stats from the database
    let stats;
    
    try {
      // Try to import the getGroupStats function if it exists
      const { getGroupStats } = require('~/models');
      stats = await getGroupStats();
    } catch (statsError) {
      // Fallback to basic stats if getGroupStats is not available
      const totalUsers = await User.countDocuments({});
      
      stats = {
        totalGroups: 0,
        activeGroups: 0, 
        totalMembers: totalUsers,
        averageMembersPerGroup: 0,
        groupsWithTimeWindows: 0,
      };
      
      logger.warn('getGroupStats function not available, using fallback stats:', statsError.message);
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Error fetching group statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getGroupsHandler,
  getGroupHandler,
  createGroupHandler,
  updateGroupHandler,
  deleteGroupHandler,
  getGroupStatsHandler,
};