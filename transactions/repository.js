import admin from 'firebase-admin';

export class TransactionRepository {

    findByUserUid(uid) {
        return admin.firestore()
            .collection('transactions')
            .where('user.uid', '==', uid)
            .orderBy('date', 'desc')
            .get()
            .then(snapshot => {
                return snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        ...data,
                        uid: doc.id,
                        date: data.date ? {
                            seconds: data.date.seconds,
                            nanoseconds: data.date.nanoseconds
                        } : null
                    };
                });
            });
    }

    findByUid(uid) {
        return admin.firestore()
            .collection("transactions")
            .doc(uid)
            .get()
            .then(snapshot => {
                const data = snapshot.data();
                if (!data) return null;
                return {
                    ...data,
                    date: data.date ? {
                        seconds: data.date.seconds,
                        nanoseconds: data.date.nanoseconds
                    } : null
                };
            });
    }

    save(transaction) {
        return admin.firestore()
            .collection("transactions")
            .add(JSON.parse(JSON.stringify(transaction)))
            .then(response => ({ uid: response.id }));
    }

    update(transaction) {
        return admin.firestore()
            .collection("transactions")
            .doc(transaction.uid)
            .update({
                date: transaction.date,
                description: transaction.description,
                money: transaction.money,
                transactionType: transaction.transactionType,
                type: transaction.type
            });
    }

    delete(transaction) {
        return admin.firestore()
            .collection("transactions")
            .doc(transaction.uid)
            .delete();
    }
}