function ipToHex(ip) {
    const segments = ip.split('.');

    const hexSegments = segments.map(segment => {
        const hex = parseInt(segment, 10).toString(16).toUpperCase();
        return hex.padStart(2, '0');
    });

    return hexSegments.join('');
}

function ipToInt32(ip) {
    const segments = ip.split('.');
    let sm = 0;
    let mult = 1;
    for (let i = 3; i >= 0; i--) {
        let x = parseInt(segments[i], 10);
        sm += mult * x;
        mult *= 256;
    }
    return sm;

}


function getChecksum(sourceIP, destIP, sourceport, destinationport, datalength_in_bytes, DATA) {

    const UDP_protocol = 17;

    if (datalength_in_bytes % 2 == 1) datalength_in_bytes += 1;

    const buffer = new ArrayBuffer(datalength_in_bytes + 20);
    const dataview = new DataView(buffer);
    console.log(`Data Length in bytes: ${datalength_in_bytes}`);

    dataview.setInt32(0, ipToInt32(sourceIP), false);
    dataview.setInt32(4, ipToInt32(destIP), false);
    dataview.setInt8(8, 0, false);
    dataview.setInt8(9, UDP_protocol, false);
    dataview.setInt16(10, datalength_in_bytes + 8, false);
    dataview.setInt16(12, sourceport, false);
    dataview.setInt16(14, destinationport, false);
    dataview.setInt16(16, datalength_in_bytes + 8, false);
    dataview.setInt16(18, 0, false);
    for (let i = 0; i < datalength_in_bytes; i++) {
        dataview.setInt8(20 + i, DATA[i] || 0, false);
    }

    let s = 0;

    // const data_as_16bits = new Uint16Array(buffer);
    const data_as_8bits = new Uint8Array(buffer);
    console.log("Data along with pseudo header: ");
    console.log(data_as_8bits);

    for (let i = 0; i < datalength_in_bytes + 20; i += 2) {
        let x = (data_as_8bits[i] << 8) | data_as_8bits[i + 1];
        s += x;

        s = (s & 0xffff) + (s >> 16);
    }

    x = (~s) & 0xffff;
    if (x == 0) return [0xffff, data_as_8bits];
    return [x, data_as_8bits];
}

function uint8ArrayToHexString(uint8Array) {
    let hexString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        let hex = uint8Array[i].toString(16);
        hex = hex.length === 1 ? '0' + hex : hex;
        hexString += hex;
    }
    return hexString;
}



function startAnimation() {
    d3.select("#animation-container").select("svg").remove();

    const sourcePort = parseInt(document.getElementById("source-port").value || 0);
    const destinationPort = parseInt(document.getElementById("destination-port").value || 0);
    const message = document.getElementById("message").value;
    const sendersIP = document.getElementById("senders-ip").value;
    const receiversIP = document.getElementById("receivers-ip").value;

    const message_to_data = new TextEncoder().encode(message);

    const [checksum, pseudo_packet_array] = getChecksum(sendersIP, receiversIP, sourcePort, destinationPort, message_to_data.length, message_to_data);

    const data_packet = new ArrayBuffer(8 + message_to_data.length);

    const dataview = new DataView(data_packet);

    dataview.setInt16(0, sourcePort, false);
    dataview.setInt16(2, destinationPort, false);
    dataview.setInt16(4, message_to_data.length + 8, false);
    dataview.setInt16(6, checksum, false);

    for (let i = 0; i < message_to_data.length; i++) {
        dataview.setInt8(8 + i, message_to_data[i] || 0, false);
    }

    console.log(`checksum: ${checksum.toString(16)}`)
    let datapacketstr = uint8ArrayToHexString(new Uint8Array(data_packet)).toUpperCase();
    console.log(`UDP Packet: ${datapacketstr} `);

    const format_udp_datagram = (datapacketstr) => {
        return `<span class="sourceportinbox">${datapacketstr.slice(0, 4)}</span>\
                <span class="destportinbox">${datapacketstr.slice(4, 8)}</span>\
                <span class="lengthinbox">${datapacketstr.slice(8, 12)}</span>\
                <span class="checksuminbox">${datapacketstr.slice(12, 16)}</span>\
                <span class="datainbox">${datapacketstr.slice(16,)}</span>`
    }
    const format_udp_pseudo_packet = (datapacketstr) => {
               
        return `<span class="lengthinbox">${datapacketstr.slice(0,8)}</span>\
                <span class="destportinbox">${datapacketstr.slice(8,16)}</span>\
                <span style="color: #aaa">${datapacketstr.slice(16,18)}</span>\
                <span class="checksuminbox">${datapacketstr.slice(18, 20)}</span>\
                <span class="lengthinbox">${datapacketstr.slice(22, 24)}</span>\
                <span class="sourceportinbox">${datapacketstr.slice(24, 28)}</span>\
                <span class="destportinbox">${datapacketstr.slice(28, 32)}</span>\
                <span class="lengthinbox">${datapacketstr.slice(32, 36)}</span>\
                <span class="checksuminbox">${datapacketstr.slice(36, 40)}</span>\
                <span class="datainbox">${datapacketstr.slice(40,)}</span>`
               
               
    }


    const svg = d3.select("#animation-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const boxCoords = [
        {
            x: 100,
            y: 200,
            title: "UDP Datagram",
            subTitle: "",
            content: `${format_udp_datagram(datapacketstr)}<br><br>Total Size: ${(datapacketstr).length / 2} octets`
        },

        {
            x: 350,
            y: 200,
            title: "UDP Header",
            subTitle: "",
            content: `                                                                                                              \
                Source Port: <span class="sourceportinbox">${datapacketstr.slice(0, 4)}    </span> (${sourcePort})             <br> \
                Destination Port: <span class="destportinbox">${datapacketstr.slice(4, 8)} </span> (${destinationPort})        <br> \
                Length: <span class="lengthinbox">${datapacketstr.slice(8, 12)}            </span> (${datapacketstr.length/2}) <br> \
                Checksum: <span class="checksuminbox">${datapacketstr.slice(12, 16)}       </span> (${checksum})               <br> \
                Message: <span class="datainbox">${datapacketstr.slice(16,)}               </span> (${message})`

        },
        {
            x: 600,
            y: 200,
            title: "Checksum",
            subTitle: "Packet used for checksum calculations",
            content: `${format_udp_pseudo_packet(uint8ArrayToHexString(pseudo_packet_array))}` 

        },
/* 
        {
            x: 800,
            y: 200,
            title: "Receiver",
            subTitle: "Receiver Side",
            content: "",
        } */
    ];

    boxCoords.forEach((coords, index) => {
        setTimeout(() => {
            const group = svg.append("g").attr("class", "animated-group");

            const rect = group.append("rect")
                .attr("x", coords.x)
                .attr("y", coords.y)
                .attr("width", 200)
                .attr("height", 100)
                .style("fill", "#f0f0f0")
                .style("stroke", "#000")
                .style("stroke-width", 2)
                .on("mouseover", () => showDetail(coords.title, coords.subTitle, coords.content));

            group.append("text")
                .attr("x", coords.x + 100)
                .attr("y", coords.y + 40)
                .text(coords.title)
                .attr("class", "header");

            /* if (index < boxCoords.length - 1) {
                const nextCoords = boxCoords[index + 1];
                svg.append("line")
                    .attr("x1", coords.x + 200)
                    .attr("y1", coords.y + 50)
                    .attr("x2", nextCoords.x)
                    .attr("y2", nextCoords.y + 50)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);
            } */

            /* if (coords.title === "Sender" && index === 0) {
                const dataPacket = group.append("rect")
                    .attr("x", coords.x + 100)
                    .attr("y", coords.y + 20)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("class", "data-packet");
            } */
        }, index * 1000); // Delay each box by 2 seconds (adjust as needed)
    });
}


function startQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = quizContainer.style.display === 'none' ? 'block' : 'none';
}

function showDetail(title, subTitle, content) {
    const detailBox = document.getElementById("detail-box");
    detailBox.innerHTML = `<h3>${title}</h3><h5>${subTitle}</h5><p>${content}</p>`;

    // Display the detail box near the hovered element
    const boundingBox = event.target.getBoundingClientRect();
    const posX = boundingBox.left + window.pageXOffset + (boundingBox.width - detailBox.offsetWidth) / 2;
    const posY = boundingBox.top + window.pageYOffset - detailBox.offsetHeight - 10;
    detailBox.style.left = posX + "px";
    detailBox.style.top = posY + "px";

    detailBox.style.display = "block";
}

function showPopUp(message, isSuccess) {
    const popUp = document.createElement("div");
    popUp.className = isSuccess ? "pop-up success" : "pop-up failure";
    popUp.textContent = message;

    document.body.appendChild(popUp);

    // Automatically remove the pop-up after a few seconds
    setTimeout(() => {
        popUp.remove();
    }, 3000); // Adjust the timeout as needed
}

function checkAnswer(correctOption) {
    const selectedOption = document.querySelector('input[name="quiz-q1"]:checked');

    if (selectedOption && selectedOption.value === correctOption) {
        showPopUp("Correct Answer! Well done!", true);
    } else {
        showPopUp("Incorrect Answer. Try again!", false);
    }
}
/* document.querySelectorAll(".header").forEach(element => {
    element.addEventListener("mouseover", () => {
        let title, subTitle, content;
        if (element.parentElement.classList.contains("sender-group")) {
            title = "Sender";
            subTitle = "Sender Side";
            content = "Data being sent";
        } else if (element.parentElement.classList.contains("udp-header-group")) {
            title = "UDP Header";
            subTitle = "UDP Header";
            const sourcePort = document.getElementById("source-port").value;
            const destinationPort = document.getElementById("destination-port").value;
            content = `Source Port: ${sourcePort}<br>Destination Port: ${destinationPort}<br>Checksum: ${Math.floor(Math.random() * 65535)}`;
        } else if (element.parentElement.classList.contains("ip-header-group")) {
            title = "IP Header";
            subTitle = "IP Header";
            content = `Version: 4<br>HLEN: 5<br>Type of service: Low Delay, High Throughput, Reliability<br>Total Length: 20 bytes<br>Identification: Unique Packet Id<br>Flags: Reserved bit (must be zero), do not fragment flag, more fragments flag<br>Fragment Offset: Number of Data Bytes ahead of the particular fragment<br>Time to live: Datagram’s lifetime<br>Protocol: Name of the protocol<br>Header Checksum: 16 bits header checksum<br>Source IP address: Sender's IP address<br>Destination IP address: Receiver's IP address<br>Option: Optional information such as source route, record route`;
        }
        showDetail(title, subTitle, content);
    });
    element.addEventListener("mouseleave", () => {
        const detailBox = document.getElementById("detail-box");
        detailBox.style.display = "none";
    });
}); */

