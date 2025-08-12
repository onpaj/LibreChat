import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Button } from '@librechat/client';
import { useNavigate } from 'react-router-dom';

export default function EmptyStatsPreview() {
  const navigate = useNavigate();

  const handleViewUserStats = () => {
    navigate('/d/statistics/users');
  };

  const handleViewGroupStats = () => {
    navigate('/d/statistics/groups');
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-6 p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-blue-100 p-4">
          <BarChart3 className="h-12 w-12 text-blue-600" />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Platform Statistics</h2>
          <p className="text-gray-600 max-w-md">
            View detailed analytics about user token usage, costs, and group performance.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={handleViewUserStats}
          className="flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View User Leaderboard</span>
        </Button>
        
        <Button 
          onClick={handleViewGroupStats}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <BarChart3 className="h-4 w-4" />
          <span>View Group Statistics</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">📊</div>
          <div className="text-sm font-medium text-gray-900 mt-2">User Rankings</div>
          <div className="text-xs text-gray-500">Token usage leaderboard</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">📈</div>
          <div className="text-sm font-medium text-gray-900 mt-2">Group Analytics</div>
          <div className="text-xs text-gray-500">Group performance metrics</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">💰</div>
          <div className="text-sm font-medium text-gray-900 mt-2">Cost Analysis</div>
          <div className="text-xs text-gray-500">Spending and usage costs</div>
        </div>
      </div>
    </div>
  );
}