import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from "react-native";

type Props = TextInputProps & {
    label?: string;
    error?: string;
};

export function InputField({
    label,
    style: inputStyle,
    error,
    secureTextEntry,
    ...props
}: Props) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                activeOpacity={1}
                style={styles.inputContainer}
                onPress={() => inputRef.current?.focus()}
            >
                <TextInput
                    ref={inputRef}
                    style={[styles.input, inputStyle]}
                    secureTextEntry={secureTextEntry ? !isPasswordVisible : false}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        style={styles.inputSuffix}
                        onPress={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                        }
                    >
                        <Ionicons
                            name={isPasswordVisible ? "eye-off" : "eye"}
                            size={20}
                            color="#5A8C88"
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 6,
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#C8EDEA",
        borderRadius: 8,
        backgroundColor: "#F0FAF9",
    },

    input: {
        minHeight: 45,
        paddingHorizontal: 8,
        flex: 1,
    },

    inputSuffix: {
        paddingHorizontal: 8,
    },

    error: {
        color: "red",
        fontSize: 12,
    },

    label: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#5A8C88",
    },
});