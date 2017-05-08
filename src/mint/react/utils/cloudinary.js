// react/utils/cloudinary.js

export const cloudinary = image => {
  return fetch('//api.cloudinary.com/v1_1/kipthis-com/image/upload', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        file: image,
        upload_preset: 'kbb6c9u1'
      })
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(`Error in put: ${response.statusText}`);
    });
};
