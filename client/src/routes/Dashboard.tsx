import { Navigate } from 'react-router-dom';
import {
  PromptsView,
  PromptForm,
  CreatePromptForm,
  EmptyPromptPreview,
} from '~/components/Prompts';
import {
  GroupsView,
  GroupForm,
  EmptyGroupPreview,
} from '~/components/Groups';
import { 
  UserLeaderboard, 
  GroupLeaderboard, 
  GroupStatsDetail, 
  EmptyStatsPreview 
} from '~/components/Statistics';
import DashboardRoute from './Layouts/Dashboard';

const dashboardRoutes = {
  path: 'd/*',
  element: <DashboardRoute />,
  children: [
    /*
    {
      element: <FileDashboardView />,
      children: [
        {
          index: true,
          element: <EmptyVectorStorePreview />,
        },
        {
          path: ':vectorStoreId',
          element: <DataTableFilePreview />,
        },
      ],
    },
    {
      path: 'files/*',
      element: <FilesListView />,
      children: [
        {
          index: true,
          element: <EmptyFilePreview />,
        },
        {
          path: ':fileId',
          element: <FilePreview />,
        },
      ],
    },
    {
      path: 'vector-stores/*',
      element: <VectorStoreView />,
      children: [
        {
          index: true,
          element: <EmptyVectorStorePreview />,
        },
        {
          path: ':vectorStoreId',
          element: <VectorStorePreview />,
        },
      ],
    },
    */
    {
      path: 'prompts/*',
      element: <PromptsView />,
      children: [
        {
          index: true,
          element: <EmptyPromptPreview />,
        },
        {
          path: 'new',
          element: <CreatePromptForm />,
        },
        {
          path: ':promptId',
          element: <PromptForm />,
        },
      ],
    },
    {
      path: 'groups/*',
      element: <GroupsView />,
      children: [
        {
          index: true,
          element: <EmptyGroupPreview />,
        },
        {
          path: 'new',
          element: <GroupForm />,
        },
        {
          path: ':groupId',
          element: <GroupForm />,
        },
      ],
    },
    {
      path: 'statistics/*',
      element: <div className="h-screen w-full"><UserLeaderboard /></div>,
      children: [
        {
          index: true,
          element: <EmptyStatsPreview />,
        },
        {
          path: 'users',
          element: <UserLeaderboard />,
        },
        {
          path: 'groups',
          element: <GroupLeaderboard />,
        },
        {
          path: 'groups/:groupId',
          element: <GroupStatsDetail />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/d/prompts" replace={true} />,
    },
  ],
};

export default dashboardRoutes;
