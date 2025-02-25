const YIN = (params = {}) => {
    const DEFAULT_YIN_PARAMS = {
        threshold: 0.1,
        sampleRate: 44100,
        probabilityThreshold: 0.2,
    };
    const config = { ...DEFAULT_YIN_PARAMS, ...params };
    const { threshold, sampleRate, probabilityThreshold } = config;

    return (float32AudioBuffer) => {
        let bufferSize;
        for (bufferSize = 1; bufferSize < float32AudioBuffer.length; bufferSize *= 2);
        bufferSize /= 2;

        const yinBufferLength = bufferSize / 2;
        const yinBuffer = new Float32Array(yinBufferLength);
        let probability = 0, tau;

        for (let t = 0; t < yinBufferLength; t++) {
            yinBuffer[t] = 0;
        }
        for (let t = 1; t < yinBufferLength; t++) {
            for (let i = 0; i < yinBufferLength; i++) {
                const delta = float32AudioBuffer[i] - float32AudioBuffer[i + t];
                yinBuffer[t] += delta * delta;
            }
        }

        yinBuffer[0] = 1;
        yinBuffer[1] = 1;
        let runningSum = 0;
        for (let t = 1; t < yinBufferLength; t++) {
            runningSum += yinBuffer[t];
            yinBuffer[t] *= t / runningSum;
        }

        for (tau = 2; tau < yinBufferLength; tau++) {
            if (yinBuffer[tau] < threshold) {
                while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                probability = 1 - yinBuffer[tau];
                break;
            }
        }

        if (tau === yinBufferLength || yinBuffer[tau] >= threshold) return null;
        if (probability < probabilityThreshold) return null;

        let betterTau, x0, x2;
        if (tau < 1) {
            x0 = tau;
        } else {
            x0 = tau - 1;
        }
        if (tau + 1 < yinBufferLength) {
            x2 = tau + 1;
        } else {
            x2 = tau;
        }

        if (x0 === tau) {
            betterTau = (yinBuffer[tau] <= yinBuffer[x2]) ? tau : x2;
        } else if (x2 === tau) {
            betterTau = (yinBuffer[tau] <= yinBuffer[x0]) ? tau : x0;
        } else {
            const s0 = yinBuffer[x0];
            const s1 = yinBuffer[tau];
            const s2 = yinBuffer[x2];
            betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
        }

        return { pitch: sampleRate / betterTau, probability };
    };
};

console.log('pitch detect algorithm is implemented by "pitchfinder" package ')
const detectPitch = YIN();

// HMM 处理，存储历史 pitch 轨迹
const pitchHistory = [];
const historySize = 3; // 只存储最近 5 次检测
const smoothPitch = (pitch, probability) => {
    if (probability < 0.5) return null; // 低概率时不考虑

    pitchHistory.push(pitch);
    if (pitchHistory.length > historySize) {
        pitchHistory.shift(); // 维持固定大小
    }

    // 使用中位数滤波法，减少突变
    const sorted = [...pitchHistory].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
};

self.onmessage = (event) => {
    const data = event.data;
    const result = detectPitch(data.audioData);
    console.log('getdata')
    if (!result || result.pitch < 50 || result.pitch > 4000) return;

    const stablePitch = smoothPitch(result.pitch, result.probability);
    if (stablePitch) {
        self.postMessage(stablePitch);
    }
};
