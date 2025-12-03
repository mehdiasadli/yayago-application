import { procedures } from '../../procedures';
import { AutoDevService } from './autodev.service';
import { DecodeVinInputSchema, DecodeVinOutputSchema } from '@yayago-app/validators';

export default {
  /**
   * Decode a VIN and return vehicle information with matched brand/model
   * Only accessible by partners (organization members)
   */
  decodeVin: procedures.partner
    .input(DecodeVinInputSchema)
    .output(DecodeVinOutputSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.session.organization?.id;
      return AutoDevService.decodeVin(input, context.locale, organizationId);
    }),
};
