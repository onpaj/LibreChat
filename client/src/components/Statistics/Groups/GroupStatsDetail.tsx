import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Clock, 
  Calendar,
  BarChart,
  PieChart,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { Button, Spinner } from '@librechat/client';
import { useGroupStatistics, useGroupMemberStatistics, GroupMemberStatistics } from '../hooks';
import { formatNumber, formatCurrency, formatRelativeTime, formatPercentage } from '~/utils';
import { useParams, useNavigate } from 'react-router-dom';

interface GroupMembersTableProps {
  members: GroupMemberStatistics[];
  groupTotalTokens: number;
  isLoading: boolean;
}

const GroupMembersTable: React.FC<GroupMembersTableProps> = ({ members, groupTotalTokens, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
        <span className="ml-2 text-gray-600">Loading members...</span>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-gray-500">No member activity found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tokens Used
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cost
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              % of Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Activity
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {members.map((member) => (
            <tr key={member.userId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(member.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {member.username || member.email}
                    </div>
                    <div className="text-sm text-gray-500">#{member.rank}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatNumber(member.tokens)}</div>
                <div className="text-xs text-gray-500">
                  {formatNumber(member.promptTokens)} + {formatNumber(member.completionTokens)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatCurrency(member.cost)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-medium ${member.balance < 1000 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatNumber(member.balance)}
                </div>
                {member.balance < 1000 && (
                  <div className="flex items-center text-xs text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low balance
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{member.percentageOfGroup}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-600 h-1 rounded-full" 
                    style={{ width: `${Math.min(member.percentageOfGroup, 100)}%` }}
                  ></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatRelativeTime(member.lastActivity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const GroupStatsDetail: React.FC = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const [dateRange, setDateRange] = useState<{ dateFrom?: string; dateTo?: string }>({});
  const [showMembers, setShowMembers] = useState(true);

  if (!groupId) {
    return <div>Group ID not found</div>;
  }

  const { 
    data: groupStats, 
    isLoading: isLoadingStats, 
    error: statsError,
    refetch: refetchStats
  } = useGroupStatistics(groupId, {
    ...dateRange,
    includeMemberDetails: true
  });

  const { 
    data: membersData, 
    isLoading: isLoadingMembers,
    error: membersError
  } = useGroupMemberStatistics(groupId, {
    ...dateRange,
    limit: 50
  });

  const members = membersData?.members || [];
  const groupTotalTokens = membersData?.groupTotals.totalTokens || 0;

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8" />
        <span className="ml-2 text-gray-600">Loading group statistics...</span>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">Error loading group statistics</div>
        <Button onClick={() => refetchStats()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (!groupStats) {
    return <div>Group not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/d/statistics/groups')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Groups</span>
        </Button>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{groupStats.groupName}</h1>
          <p className="text-gray-600 mt-1">
            {groupStats.memberCount} members • 
            {groupStats.isActive ? ' Active' : ' Inactive'} •
            {groupStats.timeWindows.length > 0 && ` ${groupStats.timeWindows.length} time windows`}
          </p>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => refetchStats()} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(groupStats.totalUsage.totalTokens)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(groupStats.totalUsage.totalCost)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {groupStats.totalUsage.activeMemberCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversations</p>
              <p className="text-2xl font-bold text-gray-900">
                {groupStats.totalUsage.conversationCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period Comparison */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Period Comparison
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(groupStats.periodComparison.thisMonth.tokens)} tokens</div>
                  <div className="text-sm text-gray-500">{formatCurrency(groupStats.periodComparison.thisMonth.cost)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Month</span>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(groupStats.periodComparison.lastMonth.tokens)} tokens</div>
                  <div className="text-sm text-gray-500">{formatCurrency(groupStats.periodComparison.lastMonth.cost)}</div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Growth</span>
                  <span className={`font-medium ${
                    groupStats.periodComparison.growth.startsWith('+') 
                      ? 'text-green-600' 
                      : groupStats.periodComparison.growth.startsWith('-')
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}>
                    {groupStats.periodComparison.growth}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Group Balance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Balance</span>
                <span className="font-medium text-lg">{formatNumber(groupStats.groupBalance.totalBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average per Member</span>
                <span className="font-medium">{formatNumber(groupStats.groupBalance.averageBalance)}</span>
              </div>
              {groupStats.groupBalance.membersWithLowBalance > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                    Low Balance Members
                  </span>
                  <span className="font-medium text-red-600">{groupStats.groupBalance.membersWithLowBalance}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Models */}
      {groupStats.topModels && groupStats.topModels.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Top Models Used
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {groupStats.topModels.map((model, index) => (
                <div key={model.model} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{model.model}</div>
                      <div className="text-xs text-gray-500">{formatNumber(model.usage)} tokens</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{model.percentage}%</div>
                    <div className="text-xs text-gray-500">{formatCurrency(model.cost)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Windows */}
      {groupStats.timeWindows && groupStats.timeWindows.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Time Windows
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groupStats.timeWindows.map((timeWindow, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{timeWindow.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      timeWindow.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {timeWindow.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {timeWindow.windowType}
                  </p>
                </div>
              ))}
            </div>
            {groupStats.timeWindowCompliance && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Time Window Compliance</span>
                  <span className="font-medium text-green-600">
                    {formatPercentage(groupStats.timeWindowCompliance)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Statistics */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Member Statistics
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembers(!showMembers)}
            >
              {showMembers ? 'Hide' : 'Show'} Members
            </Button>
          </div>
        </div>
        
        {showMembers && (
          <div className="p-6">
            <GroupMembersTable 
              members={members} 
              groupTotalTokens={groupTotalTokens}
              isLoading={isLoadingMembers} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupStatsDetail;