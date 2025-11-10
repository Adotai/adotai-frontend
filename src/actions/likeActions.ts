import { db } from '../services/firebaseConfig';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  getCountFromServer // <--- IMPORTANTE
} from 'firebase/firestore';

export const toggleLikeAnimal = async (userId: number, animal: any, city?: string) => {
  if (!userId || !animal?.id) return false;
  const likeRef = doc(db, 'userLikes', `${userId}_${animal.id}`);

  try {
    const likeDoc = await getDoc(likeRef);
    if (likeDoc.exists()) {
      await deleteDoc(likeRef);
      return false; // Descurtiu
    } else {
      await setDoc(likeRef, {
        userId: userId,
        animalId: animal.id,
        animalName: animal.name,
        animalPhoto: animal.photos?.[0]?.photoUrl || null,
        animalSpecies: animal.species,
        likedAt: serverTimestamp(),
        animalLocation: city || 'Localização não informada',
      });
      return true; // Curtiu
    }
  } catch (error) {
    console.error("Erro no toggleLike:", error);
    throw error;
  }
};

// Verifica se já está curtido (para mostrar o coração certo ao abrir a tela)
export const checkIsLiked = async (userId: number, animalId: number) => {
  if (!userId || !animalId) return false;
  try {
      const likeDoc = await getDoc(doc(db, 'userLikes', `${userId}_${animalId}`));
      return likeDoc.exists();
  } catch (error) {
      console.error("Erro ao verificar like:", error);
      return false;
  }
};

export const getAnimalLikeCount = async (animalId: number): Promise<number> => {
  try {
    const q = query(
      collection(db, 'userLikes'),
      where('animalId', '==', animalId)
    );
    
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Erro ao contar likes:", error);
    return 0;
  }
};