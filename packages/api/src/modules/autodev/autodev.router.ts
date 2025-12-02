import { procedures } from '../../procedures';
import { AutoDevService } from './autodev.service';
import { DecodeVinInputSchema, DecodeVinOutputSchema } from '@yayago-app/validators';

export default {
  /**
   * Decode a VIN and return vehicle information with matched brand/model
   * Only accessible by authenticated users (partners)
   */
  decodeVin: procedures.protected
    .input(DecodeVinInputSchema)
    .output(DecodeVinOutputSchema)
    .handler(async ({ input, context: { locale } }) => {
      return AutoDevService.decodeVin(input, locale);
    }),
};

