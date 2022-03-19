import { format } from 'date-fns';
import firebase from '../../auth/AuthConfig';

export default async function handler(req, res) {
  const {  } = req;

  const date = new Date();
  await firebase.firestore().collection('postback').doc('githubActions').set({
    [format(date, 'dd_MM_yyyy')]: {
      request: req
    }
  }, { merge: true });

  res.status(200).json({
    success: true
  });
}
