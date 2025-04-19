import { StyleSheet, Text, View } from 'react-native'
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { firestore } from '@/config/firebase';
import React from 'react'

const useFetchData = <T>(
    collectionName: string,
    constrains: QueryConstraint[] = []
) => {

    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
            if(!collectionName) return;
            const collectionRef = collection(firestore, collectionName);
            const q = query(collectionRef, ...constrains);
            console.log("🚀 ~ useEffect ~ q:", q)
            console.log("🚀 ~ useEffect ~ constrains:", constrains)

            const unsub = onSnapshot(q, (snapshot) => {
                const fetchedData = snapshot.docs.map((doc) => {
                    return {
                        id: doc.id,
                        ...doc.data()
                    };
                }) as T[];
                setData(fetchedData);
                setLoading(false);
        }, (err)=>{
            console.log("Error fetching data: ", err);
            setError(err.message);
            setLoading(false);
        })
        return () => unsub();
    }, [collectionName, JSON.stringify(constrains)])

  return { data, loading, error };
}

export default useFetchData

const styles = StyleSheet.create({})