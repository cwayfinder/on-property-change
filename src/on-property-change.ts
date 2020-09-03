import { OnPropertyChangeConfig } from "./on-property-change-config";

const valuesCacheKey = Symbol();
const lastCallKey = Symbol();

const defaultConfig = {
    bulk: false,
    history: false,
};

export function OnChange(props: string | string[], config: OnPropertyChangeConfig = defaultConfig): MethodDecorator {
    const propertyNames = normaliseProps(props);

    return (clazz: any, methodName: PropertyKey): void => {
        for (const propertyName of propertyNames) {
            const originalDescriptor = Object.getOwnPropertyDescriptor(clazz, propertyName);

            Object.defineProperty(clazz, propertyName, {
                set(value) {
                    const instance = this;

                    if (value === instance[propertyName]) {
                        return;
                    }

                    ensureHiddenProps(instance);
                    updateValueCache(instance, propertyName, value);

                    if (originalDescriptor) {
                        originalDescriptor.set.call(instance, value);
                    }

                    if (shouldCallTargetMethod(clazz, instance, methodName, propertyNames, config)) {
                        callTargetMethod(clazz, instance, methodName, propertyNames, config);
                    }
                },
                get() {
                    const instance = this;
                    if (originalDescriptor) {
                        return originalDescriptor.get.call(instance);
                    } else {
                        const cache = instance[valuesCacheKey] && instance[valuesCacheKey][propertyName];
                        return cache ? cache.currentValue : undefined;
                    }
                },
            });
        }
    };
}

// This line is here for compatibility with older versions
export const OnPropertyChange = OnChange;

function normaliseProps(props: string | string[]): string[] {
    if (Array.isArray(props)) {
        return props as unknown as string[];
    } else {
        return [props as unknown as string];
    }
}

function ensureHiddenProps(instance) {
    if (!instance[valuesCacheKey]) {
        instance[valuesCacheKey] = {};
    }
    if (!instance[lastCallKey]) {
        instance[lastCallKey] = {};
    }
}

function updateValueCache(instance, propName, value) {
    if (instance[valuesCacheKey][propName]) {
        instance[valuesCacheKey][propName].firstChange = false;
    } else {
        instance[valuesCacheKey][propName] = { firstChange: true };
    }

    const cache = instance[valuesCacheKey][propName];
    cache.previousValue = cache.currentValue;
    cache.currentValue = value;
}

function shouldCallTargetMethod(clazz: any, instance: any, methodName: PropertyKey, props: string[], config: OnPropertyChangeConfig): boolean {
    const definedPropNames = Object.keys(instance[valuesCacheKey]);
    const allPropsDefined = props.every(name => definedPropNames.includes(name));
    if (allPropsDefined) {
        if (config.bulk) {
            const neverCalled = !instance[lastCallKey][methodName];
            return neverCalled || props.every(p => instance[valuesCacheKey][p].currentValue !== instance[lastCallKey][methodName][p]);
        }
        return true;
    }

    return false;
}

function callTargetMethod(clazz: any, instance: any, methodName: PropertyKey, props: string[], config: OnPropertyChangeConfig): void {
    const valueMap = instance[valuesCacheKey];
    const mapper = config.history ? p => valueMap[p] : p => valueMap[p].currentValue;
    const values = props.map(mapper);

    clazz[methodName].call(instance, ...values);

    instance[lastCallKey][methodName] = props.reduce((obj, p) => ({ ...obj, [p]: valueMap[p].currentValue }), {});
}
