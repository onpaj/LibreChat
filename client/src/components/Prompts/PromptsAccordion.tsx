import { SystemRoles } from 'librechat-data-provider';
import PromptSidePanel from '~/components/Prompts/Groups/GroupSidePanel';
import AutoSendPrompt from '~/components/Prompts/Groups/AutoSendPrompt';
import FilterPrompts from '~/components/Prompts/Groups/FilterPrompts';
import { ManageGroups } from '~/components/Groups';
import { usePromptGroupsNav } from '~/hooks';
import { useAuthContext } from '~/hooks';

export default function PromptsAccordion() {
  const groupsNav = usePromptGroupsNav();
  const { user } = useAuthContext();
  const isAdmin = user?.role === SystemRoles.ADMIN;
  
  return (
    <div className="flex h-full w-full flex-col">
      <PromptSidePanel className="mt-2 space-y-2 lg:w-full xl:w-full" {...groupsNav}>
        <FilterPrompts setName={groupsNav.setName} className="items-center justify-center" />
        <div className="flex w-full flex-row items-center justify-between">
          <div>
            {isAdmin && <ManageGroups className="text-xs bg-transparent" />}
          </div>
          <div>
            <AutoSendPrompt className="text-xs dark:text-white" />
          </div>
        </div>
      </PromptSidePanel>
    </div>
  );
}
