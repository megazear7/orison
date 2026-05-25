export default async message => {
  return new Promise(resolve => {
    resolve('Message from loader: ' + message);
  });
};
