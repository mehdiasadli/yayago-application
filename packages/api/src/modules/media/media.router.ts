import { procedures } from '../../procedures';
import { MediaService } from './media.service';
import {
  UploadMediaInputSchema,
  UploadMediaOutputSchema,
  ConfirmMediaUploadInputSchema,
  ConfirmMediaUploadOutputSchema,
  ServerUploadMediaInputSchema,
  ServerUploadMediaOutputSchema,
} from '@yayago-app/validators';

export default {
  // Generate signed upload URL for client-side upload
  generateUploadSignature: procedures.protected
    .input(UploadMediaInputSchema)
    .output(UploadMediaOutputSchema)
    .handler(async ({ input, context: { session } }) => await MediaService.generateUploadSignature(input, session.user.id)),

  // Confirm upload after client-side upload completes
  confirmUpload: procedures.protected
    .input(ConfirmMediaUploadInputSchema)
    .output(ConfirmMediaUploadOutputSchema)
    .handler(async ({ input, context: { session } }) => await MediaService.confirmUpload(input, session.user.id)),

  // Server-side upload (for smaller files or fallback)
  serverUpload: procedures.protected
    .input(ServerUploadMediaInputSchema)
    .output(ServerUploadMediaOutputSchema)
    .handler(async ({ input, context: { session } }) => await MediaService.serverUpload(input, session.user.id)),
};

