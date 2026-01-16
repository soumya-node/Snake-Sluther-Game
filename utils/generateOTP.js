function generateOTP(){
    return parseInt(Math.random() * 10000);
}

export default generateOTP;