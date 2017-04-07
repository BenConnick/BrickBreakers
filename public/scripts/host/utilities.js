// utility consts

const getRandomArrayIndex = (array, padding) => {
  const pad = padding || 0;
  return pad + Math.floor(Math.random() * (array.length - pad));
};

const getRandomArrayElem = (array, padding) => { array[getRandomArrayIndex(array, padding)]; };

// shortcut for document.querySelector
const getByClass = (className) => { document.querySelector(`.${className}`); };

// shortcut for document.querySelector
const getById = (id) => { document.getElementById(id); };

// checks to see if an element has a class
const hasClass = (ele, cls) => { !!ele.className.match(new RegExp(`(\\s|^)${cls}(\\s|$)`)); };

// adds a class to an element
const addClass = (ele, cls) => {
  if (!hasClass(ele, cls)) ele.className += ` ${cls}`;
};

// removes a class from an element
const removeClass = (ele, cls) => {
  if (hasClass(ele, cls)) {
    const reg = new RegExp(`(\\s|^)${cls}(\\s|$)`);
    ele.className = ele.className.replace(reg, ' ');
  }
};

// shorthand for querySelector
const q = (str) => { document.querySelector(str); };
