enum TMP36Type {
    //% block="(℃)" enumval=0
    TMP36_temperature_C,

    //% block="(℉)" enumval=1
    TMP36_temperature_F,
}

//% weight=10 color=#0fbc11 icon="\uf015"
namespace smarthome {
    let Reference_VOLTAGE = 3100
    let crashSensorPin: DigitalPin
    export enum DHT11_state {
        //% block="temperature(℃)" enumval=0
        DHT11_temperature_C,

        //% block="humidity(0~100)" enumval=1
        DHT11_humidity,
    }
    export enum RelayStateList {
        //% block="NC|Close NO|Open"
        On,

        //% block="NC|Open NO|Close"
        Off
    }
    export enum Distance_Unit_List {
        //% block="cm" 
        Distance_Unit_cm,

        //% block="inch"
        Distance_Unit_inch,
    }
    /**
    * TODO: Crash Sensor Setup
    */
    //% blockId=octopus_crashsetup  blockGap=10
    //% block="Setup crash sensor at pin %crashpin"
    export function crashSensorSetup(crashpin: DigitalPin): void {
        crashSensorPin = crashpin;
        pins.setPull(crashpin, PinPullMode.PullUp)
    }

    /**
    * TODO: Checks whether the crash sensor is currently pressed.
    */
    //% blockId=octopus_crash  blockGap=30
    //% block="crash sensor pressed"
    export function crashSensor(): boolean {
        let a: number = pins.digitalReadPin(crashSensorPin);
        if (a == 0) {
            return true;
        } else return false;
    }

    /**
    * TODO: get soil moisture(0~100%)
    * @param soilmoisturepin describe parameter here, eg: AnalogPin.P1
    */
    //% blockId="readsoilmoisture" block="value of soil moisture(0~100) at pin %soilhumiditypin"
    export function ReadSoilHumidity(soilmoisturepin: AnalogPin): number {
        let voltage = 0;
        let soilmoisture = 0;
        voltage = pins.map(
            pins.analogReadPin(soilmoisturepin),
            0,
            1023,
            0,
            100
        );
        soilmoisture = voltage;
        return Math.round(soilmoisture);
    }

    /**
    * TODO: get light intensity(0~100%)
    * @param lightintensitypin describe parameter here, eg: AnalogPin.P1
    */
    //% blockId="readlightintensity" block="value of light intensity(0~100) at pin %lightintensitypin"
    export function ReadLightIntensity(lightintensitypin: AnalogPin): number {
        let voltage = 0;
        let lightintensity = 0;
        voltage = pins.map(
            pins.analogReadPin(lightintensitypin),
            0,
            1023,
            0,
            100
        );
        lightintensity = voltage;
        return Math.round(lightintensity);
    }

    /**
    * TODO: get TMP36 Temperature(℃ or ℉)
    * @param temppin describe parameter here, eg: AnalogPin.P1
    */
    //% blockId="readtemp" block="value of temperature %tmp36type|at pin %temppin"
    export function ReadTemperature(tmp36type: TMP36Type, temppin: AnalogPin): number {
        let voltage = 0;
        let Temperature = 0;
        pins.digitalWritePin(DigitalPin.P0, 0)
        voltage = pins.map(
            pins.analogReadPin(temppin),
            0,
            1023,
            0,
            Reference_VOLTAGE
        );
        Temperature = (voltage - 500) / 10;

        switch (tmp36type) {
            case 0:
                return Math.round(Temperature)
                break;
            case 1:
                return Math.round(Temperature * 9 / 5 + 32)
                break;
            default:
                return 0
        }
    }

    /** 
    * TODO: get noise(dB)
    * @param noisepin describe parameter here, eg: AnalogPin.P1
    */
    //% blockId="readnoise" block="value of noise(dB) at pin %noisepin"
    export function ReadNoise(noisepin: AnalogPin): number {
        let level = 0
        let voltage = 0
        let noise = 0
        let h = 0
        let l = 0
        let sumh = 0
        let suml = 0
        pins.digitalWritePin(DigitalPin.P0, 0)
        for (let i = 0; i < 1000; i++) {
            level = level + pins.analogReadPin(noisepin)
        }
        level = level / 1000
        for (let i = 0; i < 1000; i++) {
            voltage = pins.analogReadPin(noisepin)
            if (voltage >= level) {
                h += 1
                sumh = sumh + voltage
            } else {
                l += 1
                suml = suml + voltage
            }
        }
        if (h == 0) {
            sumh = level
        } else {
            sumh = sumh / h
        }
        if (l == 0) {
            suml = level
        } else {
            suml = suml / l
        }
        noise = sumh - suml
        if (noise <= 4) {
            noise = pins.map(
                noise,
                0,
                4,
                30,
                50
            )
        } else if (noise <= 8) {
            noise = pins.map(
                noise,
                4,
                8,
                50,
                55
            )
        } else if (noise <= 14) {
            noise = pins.map(
                noise,
                9,
                14,
                55,
                60
            )
        } else if (noise <= 32) {
            noise = pins.map(
                noise,
                15,
                32,
                60,
                70
            )
        } else if (noise <= 60) {
            noise = pins.map(
                noise,
                33,
                60,
                70,
                75
            )
        } else if (noise <= 100) {
            noise = pins.map(
                noise,
                61,
                100,
                75,
                80
            )
        } else if (noise <= 150) {
            noise = pins.map(
                noise,
                101,
                150,
                80,
                85
            )
        } else if (noise <= 231) {
            noise = pins.map(
                noise,
                151,
                231,
                85,
                90
            )
        } else {
            noise = pins.map(
                noise,
                231,
                1023,
                90,
                120
            )
        }
        noise = Math.round(noise)
        return Math.round(noise)
    }
    /**
    * get dht11 temperature and humidity Value
    * @param dht11pin describe parameter here, eg: DigitalPin.P15     
    */
    //% blockId="readdht11" block="DHT11 sensor %pin %dht11state value"
    //% dht11state.fieldEditor="gridpicker" dht11state.fieldOptions.columns=1
    /*export function dht11Sensor(pin: DigitalPin, dht11state: DHT11_state): number {
        basic.pause(2000)  //两次请求之间必须间隔2000ms以上
        pins.digitalWritePin(pin, 0)
        basic.pause(18)
        let i = pins.digitalReadPin(pin)
        pins.setPull(pin, PinPullMode.PullUp);
        switch (dht11state) {
            case 0:
                let dhtvalue1 = 0;
                let dhtcounter1 = 0;
                while (pins.digitalReadPin(pin) == 1);
                while (pins.digitalReadPin(pin) == 0);
                while (pins.digitalReadPin(pin) == 1);
                for (let i = 0; i <= 32 - 1; i++) {
                    while (pins.digitalReadPin(pin) == 0);
                    dhtcounter1 = 0
                    while (pins.digitalReadPin(pin) == 1) {
                        dhtcounter1 += 1;
                    }
                    if (i > 15) {
                        if (dhtcounter1 > 2) {
                            dhtvalue1 = dhtvalue1 + (1 << (31 - i));
                        }
                    }
                }
                return ((dhtvalue1 & 0x0000ff00) >> 8);
                break;
            case 1:
                while (pins.digitalReadPin(pin) == 1);
                while (pins.digitalReadPin(pin) == 0);
                while (pins.digitalReadPin(pin) == 1);

                let value = 0;
                let counter = 0;

                for (let i = 0; i <= 8 - 1; i++) {
                    while (pins.digitalReadPin(pin) == 0);
                    counter = 0
                    while (pins.digitalReadPin(pin) == 1) {
                        counter += 1;
                    }
                    if (counter > 3) {
                        value = value + (1 << (7 - i));
                    }
                }
                return value;
            default:
                return 0;
        }
    }*/
    /**
    * toggle fans
    */
    //% blockId=fans block="Motor fan %pin toggle to $fanstate || speed %speed \\%"
    //% fanstate.shadow="toggleOnOff"
    //% speed.min=0 speed.max=100
    //% expandableArgumentMode="toggle"
    export function motorFan(pin: AnalogPin, fanstate: boolean, speed: number = 100): void {
        if (fanstate) {
            pins.analogSetPeriod(pin, 100)
            pins.analogWritePin(pin, Math.map(speed, 0, 100, 0, 1023))
        }
        else {
            pins.analogWritePin(pin, 0)
            speed = 0
        }
    }
    /**
    * toggle Relay
    */
    //% blockId=Relay block="Relay %pin toggle to %Relaystate"
    //% Relaystate.fieldEditor="gridpicker"
    //% Relaystate.fieldOptions.columns=1
    export function Relay(pin: DigitalPin, Relaystate: RelayStateList): void {
        switch (Relaystate) {
            case RelayStateList.On:
                pins.digitalWritePin(pin, 0)
                break;
            case RelayStateList.Off:
                pins.digitalWritePin(pin, 1)
                break;
        }
    }
    /**
* get Ultrasonic distance
*/
    //% blockId=sonarbit block="Ultrasonic sensor pin%pinT distance %distance_unit"
    //% distance_unit.fieldEditor="gridpicker"
    //% distance_unit.fieldOptions.columns=2
    export function ultrasoundSensor(pinT: DigitalPin, distance_unit: Distance_Unit_List): number {
        pins.setPull(pinT, PinPullMode.PullNone)
        pins.digitalWritePin(pinT, 0)
        control.waitMicros(2)
        pins.digitalWritePin(pinT, 1)
        control.waitMicros(10)
        pins.digitalWritePin(pinT, 0)

        // read pulse
        let d = pins.pulseIn(pinT, PulseValue.High, 25000)
        let distance = d * 9 / 6 / 58

        if (distance > 400) {
            distance = 0
        }
        switch (distance_unit) {
            case Distance_Unit_List.Distance_Unit_cm:
                return Math.floor(distance)  //cm
                break
            case Distance_Unit_List.Distance_Unit_inch:
                return Math.floor(distance / 254)   //inch
                break
            default:
                return 0
        }
    }
    /**
* TODO: Detect soil moisture value(0~100%)
* @param soilmoisturepin describe parameter here, eg: DigitalRJPin.J1
*/
    //% blockId="PIR" block="PIR sensor %pin detects motion"
    export function PIR(pin: DigitalPin): boolean {
        if (pins.digitalReadPin(pin) == 1) {
            return true
        }
        else {
            return false
        }
    }
    /**
    * toggle led
    */
    //% blockId=LED block="LED %pin toggle to $ledstate || brightness %brightness \\%"
    //% brightness.min=0 brightness.max=100
    //% ledstate.shadow="toggleOnOff"
    //% expandableArgumentMode="toggle"
    export function ledBrightness(pin: AnalogPin, ledstate: boolean, brightness: number = 100): void {
        if (ledstate) {
            pins.analogSetPeriod(pin, 100)
            pins.analogWritePin(pin, Math.map(brightness, 0, 100, 0, 1023))
        }
        else {
            pins.analogWritePin(pin, 0)
            brightness = 0
        }
    }

    //% blockId="readUVLevel" block="UV sensor %pin level(0~15)"
    export function UVLevel(pin: AnalogPin): number {
        let UVlevel = pins.analogReadPin(pin);
        if (UVlevel > 625) {
            UVlevel = 625
        }
        UVlevel = pins.map(
            UVlevel,
            0,
            625,
            0,
            15
        );
        return Math.round(UVlevel)
    }

    //% blockId="readmq3" block="Alcohol sensor %pin value(0~100)"
    export function mq3(pin: AnalogPin): number {
        let mq3_value = pins.analogReadPin(pin);
        if (mq3_value > 1000) {
            mq3_value = 1000
        }
        let mq3_value_map = pins.map(mq3_value, 0, 1000, 0, 100)
        return Math.round(mq3_value_map);
    }

    function waitPinState(pin: DigitalPin, state: number, timeoutUs: number): boolean {
        let timeout = input.runningTimeMicros() + timeoutUs
        while (pins.digitalReadPin(pin) != state) {
            if (input.runningTimeMicros() > timeout) {
                return false //timeout
            }
        }
        return true
    }
    //% blockId="readdht11" block="DHT11 sensor %Rjpin %dht11state value"
    //% Rjpin.fieldEditor="gridpicker" dht11state.fieldEditor="gridpicker"
    //% Rjpin.fieldOptions.columns=2 dht11state.fieldOptions.columns=1
    export function dht11Sensor(pin: DigitalPin, dht11state: DHT11_state): number {
        //initialize
        basic.pause(1100)
        let _temperature: number = -999.0
        let _humidity: number = -999.0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)


        pins.setPull(pin, PinPullMode.PullUp)
        pins.digitalWritePin(pin, 0) //begin protocol, pull down pin
        basic.pause(25)
        pins.digitalReadPin(pin) //pull up pin
        control.waitMicros(40)

        while (pins.digitalReadPin(pin) == 0); //sensor response
        while (pins.digitalReadPin(pin) == 1); //sensor response
        if (!waitPinState(pin, 1, 1000)) return 0
        if (!waitPinState(pin, 0, 1000)) return 0
        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            if (!waitPinState(pin, 0, 1000)) return 0
            if (!waitPinState(pin, 1, 1000)) return 0
            control.waitMicros(28)
            //if sensor still pull up data pin after 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(pin) == 1) dataArray[index] = true
        }
        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)
        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
        checksum = resultArray[4]
        if (checksumTmp >= 512) checksumTmp -= 512
        if (checksumTmp >= 256) checksumTmp -= 256
        switch (dht11state) {
            case DHT11_state.DHT11_temperature_C:
                _temperature = resultArray[2] + resultArray[3] / 100
                return _temperature
            case DHT11_state.DHT11_humidity:
                _humidity = resultArray[0] + resultArray[1] / 100
                return _humidity
        }
        return 0
    }
}
