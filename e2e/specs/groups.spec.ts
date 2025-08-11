import { test, expect } from '@playwright/test';

// Test helpers
async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/c/new');
}

async function navigateToGroups(page: any) {
  await page.goto('/d/groups');
  await page.waitForSelector('h2:has-text("Groups")');
}

test.describe('Group Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication as admin
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-admin-token');
      localStorage.setItem('user', JSON.stringify({
        id: '123',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User'
      }));
    });
  });

  test('should display groups dashboard for admin users', async ({ page }) => {
    await page.goto('/d/groups');
    
    // Check for groups page elements
    await expect(page.locator('h2:has-text("Groups")')).toBeVisible();
    await expect(page.locator('button:has-text("New")')).toBeVisible();
    await expect(page.locator('input[placeholder="Search groups..."]')).toBeVisible();
  });

  test('should navigate to create group form', async ({ page }) => {
    await page.goto('/d/groups');
    
    // Click on New button
    await page.click('button:has-text("New")');
    await page.waitForURL('/d/groups/new');
    
    // Check form elements
    await expect(page.locator('h1:has-text("Create New Group")')).toBeVisible();
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('textarea#description')).toBeVisible();
    await expect(page.locator('button:has-text("Create Group")')).toBeVisible();
  });

  test('should create a new group', async ({ page }) => {
    await page.goto('/d/groups/new');
    
    // Fill in the form
    const groupName = `Test Group ${Date.now()}`;
    await page.fill('input#name', groupName);
    await page.fill('textarea#description', 'This is a test group created by Playwright');
    
    // Mock API response
    await page.route('/api/groups', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Group created successfully',
            data: {
              _id: '123456',
              name: groupName,
              description: 'This is a test group created by Playwright',
              isActive: true,
              memberCount: 0,
              timeWindows: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          })
        });
      }
    });
    
    // Submit the form
    await page.click('button:has-text("Create Group")');
    
    // Should redirect to groups list
    await page.waitForURL('/d/groups');
  });

  test('should display group list', async ({ page }) => {
    // Mock API response for groups list
    await page.route('/api/groups*', async route => {
      if (route.request().method() === 'GET' && !route.request().url().includes('/api/groups/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              groups: [
                {
                  _id: '1',
                  name: 'Engineering Team',
                  description: 'Development team members',
                  isActive: true,
                  memberCount: 15,
                  timeWindows: [],
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z'
                },
                {
                  _id: '2',
                  name: 'Marketing Team',
                  description: 'Marketing department',
                  isActive: false,
                  memberCount: 8,
                  timeWindows: [{ name: 'Business Hours', isActive: true }],
                  createdAt: '2024-01-02T00:00:00Z',
                  updatedAt: '2024-01-02T00:00:00Z'
                }
              ],
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 2,
                itemsPerPage: 10
              }
            }
          })
        });
      }
    });

    await page.goto('/d/groups');
    await page.waitForSelector('h3:has-text("Engineering Team")');
    
    // Check that groups are displayed
    await expect(page.locator('h3:has-text("Engineering Team")')).toBeVisible();
    await expect(page.locator('text=15 members')).toBeVisible();
    
    await expect(page.locator('h3:has-text("Marketing Team")')).toBeVisible();
    await expect(page.locator('text=8 members')).toBeVisible();
    await expect(page.locator('text=1 time restrictions')).toBeVisible();
  });

  test('should search for groups', async ({ page }) => {
    // Mock API response for search
    await page.route('/api/groups*', async route => {
      const url = route.request().url();
      if (url.includes('search=marketing')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              groups: [
                {
                  _id: '2',
                  name: 'Marketing Team',
                  description: 'Marketing department',
                  isActive: false,
                  memberCount: 8,
                  timeWindows: [],
                  createdAt: '2024-01-02T00:00:00Z',
                  updatedAt: '2024-01-02T00:00:00Z'
                }
              ],
              pagination: {
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
                itemsPerPage: 10
              }
            }
          })
        });
      }
    });

    await page.goto('/d/groups');
    
    // Search for marketing
    await page.fill('input[placeholder="Search groups..."]', 'marketing');
    await page.waitForTimeout(500); // Wait for debounce
    
    // Should show only Marketing Team
    await expect(page.locator('h3:has-text("Marketing Team")')).toBeVisible();
    await expect(page.locator('h3:has-text("Engineering Team")')).not.toBeVisible();
  });

  test('should edit an existing group', async ({ page }) => {
    const groupId = '123456';
    
    // Mock API response for getting group
    await page.route(`/api/groups/${groupId}`, async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: groupId,
              name: 'Original Group Name',
              description: 'Original description',
              isActive: true,
              memberCount: 5,
              timeWindows: [],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          })
        });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Group updated successfully',
            data: {
              _id: groupId,
              name: 'Updated Group Name',
              description: 'Updated description',
              isActive: false,
              memberCount: 5,
              timeWindows: [],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: new Date().toISOString()
            }
          })
        });
      }
    });

    await page.goto(`/d/groups/${groupId}`);
    await page.waitForSelector('h1:has-text("Edit Group")');
    
    // Update the form
    await page.fill('input#name', 'Updated Group Name');
    await page.fill('textarea#description', 'Updated description');
    
    // Toggle active status
    await page.click('button:has-text("Group Active")');
    
    // Submit the form
    await page.click('button:has-text("Update Group")');
    
    // Should redirect to groups list
    await page.waitForURL('/d/groups');
  });

  test('should delete a group', async ({ page }) => {
    const groupId = '123456';
    
    // Mock API responses
    await page.route(`/api/groups/${groupId}`, async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              _id: groupId,
              name: 'Group to Delete',
              description: 'This group will be deleted',
              isActive: true,
              memberCount: 0,
              timeWindows: [],
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z'
            }
          })
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'Group deleted successfully'
          })
        });
      }
    });

    await page.goto(`/d/groups/${groupId}`);
    await page.waitForSelector('h1:has-text("Edit Group")');
    
    // Handle confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    await page.click('button:has-text("Delete")');
    
    // Should redirect to groups list
    await page.waitForURL('/d/groups');
  });

  test('should show empty state when no groups exist', async ({ page }) => {
    // Mock API response with empty groups
    await page.route('/api/groups*', async route => {
      if (route.request().method() === 'GET' && !route.request().url().includes('/api/groups/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              groups: [],
              pagination: {
                currentPage: 1,
                totalPages: 0,
                totalItems: 0,
                itemsPerPage: 10
              }
            }
          })
        });
      }
    });

    // Mock stats API
    await page.route('/api/groups/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            totalGroups: 0,
            activeGroups: 0,
            totalMembers: 0,
            averageMembersPerGroup: 0,
            groupsWithTimeWindows: 0
          }
        })
      });
    });

    await page.goto('/d/groups');
    
    // Check empty state
    await expect(page.locator('h2:has-text("Group Management")')).toBeVisible();
    await expect(page.locator('text=Create and manage user groups')).toBeVisible();
    await expect(page.locator('button:has-text("Create First Group")')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/d/groups/new');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Group")');
    
    // Should show validation error
    await expect(page.locator('text=Group name is required')).toBeVisible();
    
    // Enter a very long name (over 100 characters)
    const longName = 'A'.repeat(101);
    await page.fill('input#name', longName);
    await page.click('button:has-text("Create Group")');
    
    // Should show length validation error
    await expect(page.locator('text=Group name must be less than 100 characters')).toBeVisible();
    
    // Enter valid name but very long description
    await page.fill('input#name', 'Valid Group Name');
    const longDescription = 'B'.repeat(501);
    await page.fill('textarea#description', longDescription);
    await page.click('button:has-text("Create Group")');
    
    // Should show description length error
    await expect(page.locator('text=Description must be less than 500 characters')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('/api/groups', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            message: 'Internal server error'
          })
        });
      }
    });

    await page.goto('/d/groups/new');
    
    // Fill and submit form
    await page.fill('input#name', 'Test Group');
    await page.fill('textarea#description', 'Test description');
    await page.click('button:has-text("Create Group")');
    
    // Should stay on the same page (not redirect)
    await expect(page).toHaveURL('/d/groups/new');
  });

  test('should deny access for non-admin users', async ({ page }) => {
    // Override with non-admin user
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-user-token');
      localStorage.setItem('user', JSON.stringify({
        id: '456',
        email: 'user@example.com',
        role: 'user',
        name: 'Regular User'
      }));
    });

    await page.goto('/d/groups');
    
    // Should redirect to chat or show access denied
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL('/c/new');
  });
});