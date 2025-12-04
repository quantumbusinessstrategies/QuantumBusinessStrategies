const walletBtn = document.createElement('div');
walletBtn.className = 'btn-wallet';
walletBtn.innerHTML = '&#11044;';
document.body.appendChild(walletBtn);

let angle = 0;

function rotateHex() {
    angle += 0.02;
    walletBtn.style.transform = `rotate(${angle}rad)`;
    requestAnimationFrame(rotateHex);
}
rotateHex();

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            walletBtn.innerHTML = account.slice(0, 6) + '...' + account.slice(-4);
            walletBtn.classList.add('connected');
            alert('Wallet connected: ' + account);
        } catch (err) {
            console.error(err);
            alert('Wallet connection rejected.');
        }
    } else {
        alert('Metamask not detected. Please install Metamask!');
    }
}

walletBtn.onclick = connectWallet;
