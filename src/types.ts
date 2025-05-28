export type Animal = {
  id: number;
  name: string;
  [key: string]: any; 
};

export type RootStackParamList = {
    Onboarding: undefined;
    SignIn: undefined;
    UserSignUp: undefined;
    ONGSignUp: undefined;
    UserHome: undefined;
    Address: {
        name: string;
        email: string;
        telephone: string;
        cpf: string;
        password: string;
        fromOng: boolean;
    };
    AdminScreen: undefined;
    ONGInfos: {
        ong: object
    }
    ONGHome: undefined;
    CreateAnimal: undefined;
    UserONGDetail: {
        ong: object
    };
    ONGAnimalDetails: {
        animal: Animal
    };
    UserAnimalDetails: {
        animal: object,
        city: string,
        ongName: string,
        ongs: object[]
    };
    UserEditProfile: {
        name: string;
        city: string;
        state: string;
        email: string;
        phone: string;
        cpf: string;
    
    };
    ONGEditProfile:{
        name: string;
        city: string;
        state: string;
        email: string;
        phone: string;
        cnpj: string;
    };
    ONGAnimalEdit:{
        animal: Animal
    }
}