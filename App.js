import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Button, Text, PermissionsAndroid, StyleSheet, TouchableOpacity } from 'react-native';
import { UsbSerialManager } from 'react-native-usb-serialport-for-android';

const SerialPortComponent = () => {
    const [receivedData, setReceivedData] = useState();
    const [usbSerialPort, setUsbSerialPort] = useState(null);
    const [speed, setSpeed] = useState(0);
    const [temp, setTemp] = useState(0);
    const [sumVoltage, setSumVoltage] = useState(0);
    const [soc, setSoc] = useState(0);
    const [distanceCovered, setDistanceCovered] = useState(0);
    const [maxVoltage, setMaxVoltage] = useState(0);
    const [powerWatt, setPowerWatt] = useState(0);
    const [distanceCoveredPrevious, setDistanceCoveredPrevious] = useState(0);
    const [range, setRange] = useState(0);
    const [faults, setFaults] = useState([]);
    const [chargeStatus, setChargeStatus] = useState(0);
    const [dataLength, setDataLength] = useState(0);
    const [firstByte, setFirstByte] = useState(0);
    const [type, setType] = useState('');
    const [devicesState, setDevicesState] = useState([]); // Burda kaldım
    const [deviceFlag, setDeviceFlag] = useState(0);
    const [previousTime, setPreviousTime] = useState(0);
    const [setIntervalFlag, setSetIntervalFlag] = useState(1)

    // function startUSBMonitoring() {
    //     const intervalId = setInterval(async () => {
    //         try {
    //             const devices = await UsbSerialManager.list();
    //             if (devices.length > 0) {
    //                 clearInterval(intervalId);
    //                 await requestUSBPermission(devices[0]);
    //             } else {
    //                 console.log('No USB devices found, retrying...');
    //             }
    //         } catch (err) {
    //             console.error('Error scanning for devices:', err);
    //         }
    //     }, 1000);
    // }

    async function requestUSBPermission() {
        try {
            setUsbSerialPort(null)
            const grantedStorage = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: "Bisco Telemetri İzni İstiyor :')",
                    message: "Bana izin ver",
                    buttonNeutral: "Şimdilik Kalsın",
                    buttonNegative: "İzin verme :(",
                    buttonPositive: "Gelsin Veriler!"
                }
            );

            if (grantedStorage !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert('Storage permission denied');
                return;
            }

            const devices = await UsbSerialManager.list();
            setDeviceFlag(devices[0]);

            if (devices.length > 0) {
                let grantedUSB = await UsbSerialManager.tryRequestPermission(devices[0].deviceId);
                await new Promise(resolve => setTimeout(resolve, 50));
                grantedUSB = await UsbSerialManager.tryRequestPermission(devices[0].deviceId);

                if (grantedUSB) {
                    setSetIntervalFlag(1);
                    // Alert.alert('USB permission granted');
                    // Portu bağlamadan önce eski bağlantıyı kapat
                    const port = await UsbSerialManager.open(devices[0].deviceId, {
                        baudRate: 115200,
                        parity: 0,
                        dataBits: 8,
                        stopBits: 1,
                    });
                    setUsbSerialPort(port);
                } else {
                    Alert.alert('USB permission denied');
                }
            } else {
                Alert.alert('No USB devices found');
            }

        } catch (err) {
            console.error('Error requesting permission:', err);
            Alert.alert('Error', err.message);
        }

    }



    // const sendData = async (data) => {
    //     try {
    //         await UsbSerialManager.send(data);
    //         console.log('Data sent:', data);
    //     } catch (error) {
    //         console.error('Error sending data:', error);
    //     }
    // };



    useEffect(() => {
        let subscription;
        let dataCheckInterval;
        if (usbSerialPort) {
            subscription = usbSerialPort.onReceived((event) => {
                setPreviousTime(new Date());
                const data = event.data;
                let modifiedSoc = 0;

                if (data[data.length - 1] + data[data.length - 2] != "FF") {
                    // Birinci Paket
                    const modifiedData = data.split("FF").filter(part => part.length > 0).map(part => parseInt(part, 16));
                    if (modifiedData[2] - 40 > 90) { return }
                    // let dataDecimalArray = [];

                    // setFirstByte(modifiedData[0]);
                    setDataLength(modifiedData.length);

                    setSpeed(parseFloat(((modifiedData[1] << 8) | modifiedData[0]) / 200).toFixed(2));
                    setTemp(modifiedData[2] - 40);
                    setSumVoltage(((modifiedData[3] << 8) | modifiedData[4]) / 10);
                    setDistanceCovered((modifiedData[5] << 8) | modifiedData[6]); // Cm cinsinden 
                    setRange(20000 - distanceCovered / 100);
                }
                else {
                    // İkinci Paket
                    const modifiedData = data.split("FF").filter(part => part.length > 0).map(part => parseInt(part, 16));
                    modifiedSoc = (modifiedData[4] << 8) | modifiedData[5]
                    if (modifiedSoc > 1000 || modifiedSoc < 0) { return }
                    // let dataDecimalArray = [];

                    // setFirstByte(modifiedData[0]);
                    setDataLength(modifiedData.length);
                    setPowerWatt((modifiedData[0] << 8) | modifiedData[1]);
                    setMaxVoltage((modifiedData[2] << 8) | modifiedData[3]);
                    setSoc(modifiedSoc / 10);
                }


                // dataCheckInterval = setInterval(() => {
                //     // Eğer belirli bir süre boyunca veri alınmadıysa
                //     // bağlantının koptuğunu varsayabilirsiniz.
                //     try {
                //         if (new Date() - previousTime > 3 && setIntervalFlag) {
                //             startUSBMonitoring();
                //             setSetIntervalFlag(0);
                //         }
                //     } catch (error) {
                //         throw error.message
                //     }

                // }, 5000);


                // for (let i = 0; i < modifiedData.length; i++) {
                //     const byte = modifiedData[i];
                //     const decimalValue = parseInt(byte);
                //     dataDecimalArray.push(byte);
                // }

            });

            return () => {
                if (subscription) {
                    subscription.remove();
                }
                if (usbSerialPort) {
                    usbSerialPort.close();
                    setUsbSerialPort(null);
                }
                // if (dataCheckInterval) {
                //     clearInterval(dataCheckInterval);
                // }

            };
        }

    }, [usbSerialPort]);


    return (
        <ScrollView style={styles.container}>

            <View style={styles.header}>
                <Button onPress={requestUSBPermission} title="Bağlan" color="#007BFF" />
                {/* <Button onPress={sendData} title='Gonder' color="#007BFF" /> */}
            </View>
            {/* <View style={styles.dataContainer}>
                <Text style={styles.title}>Alınan Veri</Text>
                <Text style={styles.data}>{receivedData}</Text>
                <Text style={styles.dataInfo}>Veri Genişliği: {dataLength}</Text>
                <Text style={styles.dataInfo}>İlk Bayt: {firstByte}</Text>
            </View> */}

            {/* <Text style={styles.title}>Alınan Veri</Text>
            <Text style={styles.data}>{receivedData}</Text> */}

            <View style={styles.speedSection}>
                <Text style={styles.sectionTitleSpeed}>Hız</Text>
                <Text style={styles.speedData}>{speed}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Şarj</Text>
                <Text style={styles.data}>{soc} %</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alınan Mesafe</Text>
                <Text style={styles.data}>{distanceCovered / 100} m</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Voltaj</Text>
                <Text style={styles.data}>{sumVoltage} V</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sıcaklık</Text>
                <Text style={styles.data}>{temp} °C</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Max Pil Voltajı</Text>
                <Text style={styles.data}>{maxVoltage / 1000} V</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Harcanan Güç</Text>
                <Text style={styles.data}>{powerWatt} W</Text>
            </View>



            {/* <View style={styles.section}>
                <Text style={styles.sectionTitle}>En Son Alınan Mesafe</Text>
                <Text style={styles.data}>{distanceCoveredPrevious} km</Text>
            </View> */}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menzil</Text>
                <Text style={styles.data}>{range} m</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Şarj Durumu</Text>
                <Text style={styles.data}>{chargeStatus ? "Şarj Oluyor" : "Şarj Olmuyor"}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Arıza</Text>
                <Text style={styles.data}>
                    {/* {faults[0]}, {faults[1]}, {faults[2]}, {faults[3]}, {faults[4]} */}
                    Yakında...
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
        marginTop: 16
    },
    header: {
        marginBottom: 20,
    },
    dataContainer: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    data: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dataInfo: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    section: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    speedSection: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center'
    },


    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007BFF',
        marginBottom: 8,
    },

    sectionTitleSpeed: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#007BFF',
    },

    speedData: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#333',

    },
});


export default SerialPortComponent;
