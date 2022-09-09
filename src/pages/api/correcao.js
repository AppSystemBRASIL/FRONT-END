import firebase from '../../auth/AuthConfig';

export default async function handler(req, res) {
  res.status(200).json({
    success: true
  });
}
