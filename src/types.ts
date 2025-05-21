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
        animal: object
    };
    UserAnimalDetails: { 
        animal: object,
        city: string
    };
}