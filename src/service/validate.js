export const validateData = async (data) => {
  return Object.keys(data).filter((e) => !data[e]);
};
