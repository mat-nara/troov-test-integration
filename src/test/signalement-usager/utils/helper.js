// 13 digits
function generateRandomNIR() { 
    const sexe = Math.random() < 0.5 ? 1 : 2;          // 1 ou 2
    const annee = String(Math.floor(Math.random() * 100)).padStart(2, '0'); // 00..99
    const mois = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'); // 01..12
    const dept = String(Math.floor(Math.random() * 96) + 1).padStart(2, '0'); // 01..95
    const commune = String(Math.floor(Math.random() * 990) + 1).padStart(3, '0');
    const ordre = String(Math.floor(Math.random() * 990) + 1).padStart(3, '0');

    return `${sexe} ${annee} ${mois} ${dept} ${commune} ${ordre}`;
}

// 10 digits with 0 as first character
function generateRandomPhone() {
    const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000); 
    return "0" + randomNumber.toString().slice(1);
}

module.exports = { generateRandomNIR, generateRandomPhone, generateFakeNIR };