import prisma from '@yayago-app/db';

export async function getUsernameFromEmail(email: string) {
  const emailUsername = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9_]/g, '');
  let usernameExists = true;
  let username = emailUsername;

  // check if exists
  while (usernameExists) {
    const user = await prisma.user.findFirst({
      where: { username },
    });

    if (!user) {
      usernameExists = false;
      break;
    }

    const randomDigit = Math.floor(1 + Math.random() * 9).toString();
    username = `${username}${randomDigit}`;
  }

  return username;
}
