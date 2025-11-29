import { procedures } from '../../procedures';
import { MemberService } from './member.service';

export default {
  isMemberOfAnyOrganization: procedures.public.handler(
    async ({ context: { session } }) => await MemberService.isMemberOfAnyOrganization(session?.user?.id)
  ),
};
