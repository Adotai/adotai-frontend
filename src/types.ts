export type Animal = {
    id: number;
    name: string;
    [key: string]: any;
};

export type UpdateUserPayload = {
    id: number;
    name?: string;
    email?: string;
    cpf?: string;
    password?: string;
    telephone?: string;
    address?: any;
    addressId?: number;
};

export type UpdateOngPayload = {
    id: number;
    name?: string;
    phone?: string;
    cnpj?: string;
    email?: string;
    password?: string;
    pix?: string;
    documents?: { socialStatute?: string; boardMeeting?: string };
    photos?: any[];
    description?: string;
    address?: any;
    addressId?: number;
};

export type RootStackParamList = {
    Onboarding: undefined;
    SignIn: undefined;
    UserSignUp: undefined;
    ONGSignUp: undefined;
    UserHome: undefined;
    Chat: {
        chatId: string,
        loggedInUserId: number
    };
    UserDonateAnimal: { ongId: number };
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
        ongs: object[],
        fromOngList: boolean
    };
    UserEditProfile: {
        name: string;
        city: string;
        state: string;
        email: string;
        phone: string;
        cpf: string;

    };
    ONGEditProfile: {
        name: string;
        city: string;
        state: string;
        email: string;
        phone: string;
        cnpj: string;
    };
    ONGAnimalEdit: {
        animal: Animal
    };
    UserAnimalONG: {
        ong: string
    }
    ONGUserProfile: { user: any };
}