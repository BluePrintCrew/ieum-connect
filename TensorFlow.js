import * as tf from '@tensorflow/tfjs';

useEffect(() => {
  try {
    console.log("TensorFlow.js 버전:", tf.version.tfjs);
    tf.tensor([1, 2, 3, 4]).print();
  } catch (error) {
    console.error("TensorFlow.js 로딩 오류:", error);
  }
}, []);
