import firebase from '../../auth/AuthConfig';

import { format } from 'date-fns';

export default async function handler(req, res) {
  const date = new Date();

  await firebase.firestore().collection('postback').doc('githubActions').set({
    [format(date, 'dd_MM_yyyy')]: format(date, 'hh:mm:ss')
  }, { merge: true });

  res.status(200).json({
    success: true
  });
}
