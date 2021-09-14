import {registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface} from 'class-validator';

@ValidatorConstraint({name: 'Match'})
export class MatchConstraint implements ValidatorConstraintInterface {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    validate(value: any, args: ValidationArguments): boolean {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = (args.object as any)[relatedPropertyName];
        return value === relatedValue;
    }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    return (object: any, propertyName: string) => {
			registerDecorator({
				target: object.constructor,
				propertyName,
				options: validationOptions,
				constraints: [property],
				validator: MatchConstraint,
			});
		};
}
