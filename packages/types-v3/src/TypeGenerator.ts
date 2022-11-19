import {
    AliasTypeDeclaration,
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    UnionTypeDeclaration,
} from "@fern-fern/ir-model/types";
import { GeneratedAliasType } from "./alias/GeneratedAliasType";
import { GeneratedAliasTypeImpl } from "./alias/GeneratedAliasTypeImpl";
import { GeneratedEnumType } from "./enum/GeneratedEnumType";
import { GeneratedEnumTypeImpl } from "./enum/GeneratedEnumTypeImpl";
import { GeneratedType } from "./GeneratedType";
import { GeneratedObjectType } from "./object/GeneratedObjectType";
import { GeneratedObjectTypeImpl } from "./object/GeneratedObjectTypeImpl";
import { GeneratedUnionType } from "./union/GeneratedUnionType";
import { GeneratedUnionTypeImpl } from "./union/GeneratedUnionTypeImpl";

export class TypeGenerator {
    public generateType(typeDeclaration: TypeDeclaration): GeneratedType {
        return Type._visit<GeneratedType>(typeDeclaration.shape, {
            union: (shape) => this.generateUnion(typeDeclaration, shape),
            object: (shape) => this.generateObject(typeDeclaration, shape),
            enum: (shape) => this.generateEnum(typeDeclaration, shape),
            alias: (shape) => this.generateAlias(typeDeclaration, shape),
            _unknown: () => {
                throw new Error("Unknown type declaration shape: " + typeDeclaration.shape._type);
            },
        });
    }

    public generateUnion(typeDeclaration: TypeDeclaration, shape: UnionTypeDeclaration): GeneratedUnionType {
        return new GeneratedUnionTypeImpl({ typeDeclaration, shape });
    }

    public generateObject(typeDeclaration: TypeDeclaration, shape: ObjectTypeDeclaration): GeneratedObjectType {
        return new GeneratedObjectTypeImpl({ typeDeclaration, shape });
    }

    public generateEnum(typeDeclaration: TypeDeclaration, shape: EnumTypeDeclaration): GeneratedEnumType {
        return new GeneratedEnumTypeImpl({ typeDeclaration, shape });
    }

    public generateAlias(typeDeclaration: TypeDeclaration, shape: AliasTypeDeclaration): GeneratedAliasType {
        return new GeneratedAliasTypeImpl({ typeDeclaration, shape });
    }
}
