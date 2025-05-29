import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: 'dtob4ibrg',
  api_key: '837972942685863',
  api_secret: 'dVaH5ZDobVz2-R9NNZuIKXYCidY'
});

export default cloudinary.v2;