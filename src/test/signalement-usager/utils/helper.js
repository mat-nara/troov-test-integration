// 13 digits
function generateRandomNIR() { 
    const randomNumber = Math.floor(1000000000000 + Math.random() * 9000000000000); 
    return "1 84 12 75 123 456 89";
    return randomNumber.toString();
}

// 10 digits with 0 as first character
function generateRandomPhone() {
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); 
    return "0" + randomNumber.toString().slice(1);
}

module.exports = { generateRandomNIR, generateRandomPhone };