let firebaseConfig = {
    apiKey: configKeys.apiKey,
    authDomain: configKeys.authDomain,
    projectId: configKeys.projectId,
    storageBucket: configKeys.storageBucket,
    messagingSenderId: configKeys.messagingSenderId,
    appId: configKeys.appId
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

chrome.runtime.onMessage.addListener((msg, sender, response) => {
    if (msg.command === 'fetch') {
        let domain = msg.data.domain;
        let encoded_domain = btoa(domain);
        firebase.database().ref(`/domain/${encoded_domain}`).once('value')
            .then(function (snapshot) {
                response({type: 'result', status: "success", data: snapshot.val(), request: msg});
            });
    }

    if (msg.command === 'post') {
        let domain = msg.data.domain;
        let encoded_domain = btoa(domain);
        let code = msg.data.code;
        let description = msg.data.description;

        try {
            let newPost = firebase.database().ref(`/domain/${encoded_domain}`).push().set({
                code: code,
                description: description
            });
            let postID = newPost.key;
            response({type: 'result', status: 'success', data: postID, request: msg});
        } catch (e) {
            console.log('error: ', e);
            response({type: 'result', status: 'error', data: e, request: msg});
        }
    }

    return true;
});