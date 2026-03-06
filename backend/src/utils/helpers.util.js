export const cleanupSlug = (str) => {
  return str.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
};

export const cleanObject = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

export const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") return 0;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes) => {
  const minutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
};

const helpers = {
  cleanupSlug,
  cleanObject,
  timeToMinutes,
  minutesToTime,
};

export default helpers;
