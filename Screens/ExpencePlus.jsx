import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard  } from "react-native"
import { useState, useEffect } from "react"
import * as SQLite from 'expo-sqlite/legacy';
import { SelectList } from "react-native-dropdown-select-list";

export default function ExpencePlus({ navigation }) {
    const db = SQLite.openDatabase('budget.db')

    const [name, setName] = useState('')
    const [price, setPrice] = useState(0)
    const [type, setType] = useState('')

    const data = [
        {key: '1', value: 'Cash'},
        {key: '2', value: 'Card'},
    ]

    const handleAddForm = () => {
        if(name != '' && price != 0 && type != '') {
        db.transaction(tx => {
            tx.executeSql('INSERT INTO expences(plus, type, expence_name, expence_value) values (?, ?, ?, ?)', [1, type, name, price],
                (txObj, resultSet) => {
                    setName('')
                    setPrice(0)
                    Keyboard.dismiss()
                    navigation.navigate("Home")
                },
                (txObj, error) => console.log(error)
            )
        })
    }
    }

    return (
        <View style={styles.form}>
            <TextInput style={styles.formInput} value={name} placeholder="Name" onChangeText={setName}/>
            <TextInput style={styles.formInput} value={price} placeholder="Price" onChangeText={setPrice} keyboardType="numeric"/>

            <View style={styles.dropdownView} >
                <SelectList
                    search={false}
                    placeholder="From"
                    data={data}
                    setSelected={(val) => setType(val)}
                    save="value"
                    boxStyles={styles.dropdown}
                    dropdownStyles={styles.dropdownStyles}
                    dropdownItemStyles={styles.dropdownItemStyles}
                />
            </View>
            

            <TouchableOpacity style={styles.formSubmitButton} onPress={() => handleAddForm()}>
                <Text style={styles.formSubmitButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    form: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        marginTop: 100
    },
    formInput: {
        width: '70%',
        height: 50,
        textAlign: 'center',
        backgroundColor: "#FFF",
        borderRadius: 10
    },
    formSubmitButton: {
        marginTop: 20,
        width: '50%',
        height: 50,
        backgroundColor: '#7aeb7a',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    }, 
    formSubmitButtonText: {
        textAlign: 'center'
    },
    dropdownView: {
        width: '70%',
        border: 'none'
    },
    dropdown: {
        backgroundColor: '#fff',
    },
    dropdownStyles: {
        backgroundColor: '#fff',
        border: 'none'
    },
    dropdownItemStyles: {
        paddingVertical: 10
    }
})