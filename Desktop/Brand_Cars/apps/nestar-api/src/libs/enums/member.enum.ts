import { registerEnumType } from "@nestjs/graphql";


export enum MemberType{
    USER = 'USER',
    AGENT = 'AGENT',
    ADMIN = 'ADMIN',
}
registerEnumType(MemberType, {
    name: 'MemberType',
});
export enum MemberStatus{
    ACTIVE ='ACTIVE',
    BLOCK = 'BLOCK',
    DELETED= 'DELETED',
}
 registerEnumType(MemberStatus, {
    name: 'MemberStatus',
});

export enum MemberAuthType{
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    TELEGRAM = 'TELEGRAM',
    GOOGLE = 'GOOGLE',
    FACEBOOK = 'FACEBOOK',
    GITHUB = 'GITHUB',
    APPLE = 'APPLE',

}
registerEnumType(MemberAuthType, {
    name: 'MemberAuthType',
});
