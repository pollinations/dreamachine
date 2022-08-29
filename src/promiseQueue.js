
let lastPromise = Promise.resolve();


const promiseQueue = f => {
    const promise = lastPromise.then(f);
    lastPromise = promise;
    return promise;
}

export default promiseQueue;