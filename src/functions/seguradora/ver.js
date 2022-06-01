import firebase from '../../auth/AuthConfig';

export default async function getSeguradoras() {
  return firebase.firestore().collection('seguradoras').get()
  .then((snap) => {
    const array = [];

    if(!snap.empty) {
      snap.forEach((item) => {
        array.push(item.data());
      });
    }

    return array;
  })
  .catch(() => []);
};