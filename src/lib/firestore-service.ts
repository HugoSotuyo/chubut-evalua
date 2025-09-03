
"use server";

import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

/**
 * Interfaz base para los documentos de Firestore que deben tener un ID.
 */
interface FirestoreDocument {
  id: string;
}

/**
 * Obtiene todos los documentos de una colección de Firestore.
 * @param collectionName El nombre de la colección.
 * @returns Una promesa que se resuelve en un array de documentos con su ID.
 */
export async function getCollection<T extends FirestoreDocument>(
  collectionName: string
): Promise<T[]> {
  try {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, collectionName));
    const data: T[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    return data;
  } catch (error) {
    console.error(`Error al obtener la colección ${collectionName}:`, error);
    throw new Error('No se pudieron obtener los datos de la base de datos.');
  }
}

/**
 * Agrega un nuevo documento a una colección de Firestore.
 * @param collectionName El nombre de la colección.
 * @param data El objeto de datos a agregar.
 * @returns Una promesa que se resuelve con el ID del nuevo documento.
 */
export async function addDocument<T extends object>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Error al agregar un documento a ${collectionName}:`, error);
    throw new Error('No se pudo guardar el nuevo elemento.');
  }
}

/**
 * Actualiza un documento existente en una colección de Firestore.
 * @param collectionName El nombre de la colección.
 * @param docId El ID del documento a actualizar.
 * @param data El objeto con los campos a actualizar.
 */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<unknown>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error al actualizar el documento ${docId} en ${collectionName}:`, error);
    throw new Error('No se pudo actualizar el elemento.');
  }
}

/**
 * Elimina un documento de una colección de Firestore.
 * @param collectionName El nombre de la colección.
 * @param docId El ID del documento a eliminar.
 */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error al eliminar el documento ${docId} en ${collectionName}:`, error);
    throw new Error('No se pudo eliminar el elemento.');
  }
}
