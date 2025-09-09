export const Image_Url = import.meta.env.VITE_APP_ENV === 'production'
  ? import.meta.env.VITE_APP_IMAGE_URL_LIVE
  : import.meta.env.VITE_APP_IMAGE_URL_LOCAL;

export const BASE_IMAGE_URL = import.meta.env.VITE_APP_ENV === 'production'
  ? import.meta.env.VITE_APP_BASE_IMAGE_URL_LIVE
  : import.meta.env.VITE_APP_BASE_IMAGE_URL_LOCAL;

  export const Image_NotFound = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXcB8kmCDKILwOjlKT8LCcCflFgH9LJnAZDuLnZ5tAsa2-oFQsvD2A37DxYCmeNrvw8PI&usqp=CAU';