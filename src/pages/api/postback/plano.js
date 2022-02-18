import firebase from '../../../auth/AuthConfig';

export default async function handler(req, res) {
  const { body, query } = req;

  await firebase.firestore().collection('postbacks').doc('plano').set({
    body,
    query,
  }, { merge: true });

  res.status(200).json({ body, query });
}