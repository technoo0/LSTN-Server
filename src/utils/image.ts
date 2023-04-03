import cloudinary from "cloudinary";


cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});


const UploadPhoto = async (Base64Data: string) => {
    // console.log("-----------------cloudinary---------------------");
    if (Base64Data) {
        try {
            const res = await cloudinary.v2.uploader.upload(Base64Data);
            if (res) {
                return res.secure_url;
            } else {
                return "";
            }
        } catch (err: any) {
            console.log(err.error.errno)
            console.log(err.error.code)
            console.log(err.error.syscall)
            for (const key in err.errno) {
                console.log(key);
            }
            new Error("Upload Filed ");
            return ""
        }
    } else {
        return "";
    }
};

export default UploadPhoto;