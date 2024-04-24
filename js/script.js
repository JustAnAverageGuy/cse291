function ipToHex(ip) {
    const segments = ip.split('.');

    const hexSegments = segments.map(segment => {
        const hex = parseInt(segment, 10).toString(16).toUpperCase();
        return hex.padStart(2, '0');
    });

    return hexSegments.join('');
}




function showpackets() {
    const senderIP     = document . getElementById('senderIP')     . value;
    const senderPort   = document . getElementById('senderPort')   . value;
    const receiverIP   = document . getElementById('receiverIP')   . value;
    const receiverPort = document . getElementById('receiverPort') . value;
    const data         = document . getElementById('data')         . value;

    console.log("Sender's IP: " + senderIP +
        "\nSender's Port: " + senderPort +
        "\nReceiver's IP: " + receiverIP +
        "\nReceiver's Port: " + receiverPort +
        "\nData: " + data);
    console.log(ipToHex(senderIP))
    const diplaySourcePort = document.getElementById('source-port');
    const diplayDestPort = document.getElementById('dest-port');
    const diplayLength = document.getElementById('length');
    const diplayData = document.getElementById('packdata');

    diplaySourcePort.textContent = ipToHex(senderIP);
    

}
