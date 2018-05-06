const zeroPad = (s, length) => {
  if (s.toString().length >= length) {
    return s;
  }

  return zeroPad(`0${s}`, length);
};

const zeroPad2 = str => zeroPad(str, 2);

const now = () => {
  const date = new Date();

  const year = date.getUTCFullYear();
  const month = zeroPad2(date.getUTCMonth() + 1);
  const day = zeroPad2(date.getUTCDate(), 2);

  const hours = zeroPad2(date.getUTCHours());
  const minutes = zeroPad2(date.getUTCMinutes());
  const seconds = zeroPad2(date.getUTCSeconds());
  const milliseconds = zeroPad2(date.getUTCMilliseconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
};

module.exports = now;
