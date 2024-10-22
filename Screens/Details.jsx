import { View, Text, TextInput, StyleSheet, TouchableOpacity, Keyboard, Button, SafeAreaView, Alert } from "react-native"
import { useState, useEffect, useCallback } from "react"
import * as SQLite from 'expo-sqlite/legacy';
import { useFocusEffect } from "@react-navigation/native";
import Feather from '@expo/vector-icons/Feather';
import { FlatList } from "react-native-gesture-handler";
import { FlashList } from "@shopify/flash-list";
import { SelectList } from "react-native-dropdown-select-list";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

export default function Details({ navigation }) {
    const db = SQLite.openDatabase('budget.db')
    const [isLoading, setIsLoading] = useState(true)
    const [expences, setExpences] = useState([])

    const [searchName, setSearchName] = useState('')
    const [searchType, setSearchType] = useState('')

    const data = [
        { label: 'Both', value: '' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Card', value: 'Card' },
    ]

    useFocusEffect(
        useCallback(() => {
            db.transaction(tx => {
                tx.executeSql("SELECT * FROM expences ORDER BY id DESC", null,
                    (txObj, resultSet) => setExpences(resultSet.rows._array),
                    (txObj, error) => console.log(error)
                )
            })
        }, [])
    )

    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM expences ORDER BY id DESC", null,
                (txObj, resultSet) => setExpences(resultSet.rows._array),
                (txObj, error) => console.log(error)
            )
        })
    }, [])

    const deleteExpence = (id) => {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM expences WHERE id = ?', [id],
                (txObj, resultSet) => {
                    tx.executeSql("SELECT * FROM expences ORDER BY id DESC", null,
                        (txObj, resultSet) => setExpences(resultSet.rows._array),
                        (txObj, error) => console.log(error))
                },
                (txObj, error) => console.log(error)
            )
        })
    }

    const handleSearch = () => {
        if (searchName != '' && searchType != '') {
            db.transaction(tx => {
                tx.executeSql(`SELECT * FROM expences WHERE expence_name LIKE '%${searchName}%' AND type = '${searchType}' ORDER BY id DESC`, null,
                    (txObj, resultSet) => setExpences(resultSet.rows._array),
                    (txObj, error) => console.log(error)
                )
            })
        }
        if (searchName != '' && searchType == '') {
            db.transaction(tx => {
                tx.executeSql(`SELECT * FROM expences WHERE expence_name LIKE '%${searchName}%' ORDER BY id DESC`, null,
                    (txObj, resultSet) => setExpences(resultSet.rows._array),
                    (txObj, error) => console.log(error)
                )
            })
        }
        if (searchName == '' && searchType != '') {
            db.transaction(tx => {
                tx.executeSql(`SELECT * FROM expences WHERE type = '${searchType}' ORDER BY id DESC`, null,
                    (txObj, resultSet) => setExpences(resultSet.rows._array),
                    (txObj, error) => console.log(error)
                )
            })
        }
        if (searchName == '' && searchType == '') {
            db.transaction(tx => {
                tx.executeSql(`SELECT * FROM expences ORDER BY id DESC`, null,
                    (txObj, resultSet) => setExpences(resultSet.rows._array),
                    (txObj, error) => console.log(error)
                )
            })
        }
    }

    const deleteAll = () => {
        Alert.alert(
            "Confirmation", // Title of the alert
            "Are you sure you want to delete everything?", // Message
            [
              {
                text: "Cancel", // Text for the Cancel button
                onPress: () => console.log("Action Canceled"), // Action to perform on Cancel
                style: "cancel", // Styling for the Cancel button
              },
              {
                text: "OK", // Text for the OK button
                onPress: () => {
                    db.transaction(tx => {
                        tx.executeSql('DELETE FROM expences', null,
                            (txObj, resultSet) => {
                                console.log("DELETED")
                                setExpences([])
                            },
                            (txObj, error) => console.log(error)
                        )
                    })
                }, // Action to perform on Confirm
              },
            ],
            { cancelable: false } // If true, alert can be dismissed by tapping outside
          );
    }

    return (
        <View style={styles.container}>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.formInput}
                    placeholder="Search by name"
                    onChangeText={setSearchName}
                />

                <View style={styles.dropdownView} >
                    <SelectList
                        mode='modal'
                        search={false}
                        placeholder="From"
                        data={data}
                        setSelected={(val) => setSearchType(val)}
                        save="value"
                        labelField="label"
                        valueField="value"
                        boxStyles={styles.dropdown}
                        dropdownStyles={styles.dropdownStyles}
                        dropdownItemStyles={styles.dropdownItemStyles}
                    />
                </View>

                <View style={styles.searchBox}>
                    <TouchableOpacity style={styles.searchInput} onPress={() => handleSearch()}>
                        <Text>Search</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.searchBoxDelete} onPress={() => deleteAll()}>
                        <Text><FontAwesome5 name="trash" size={18} color="black" /></Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlashList
                style={styles.marginBlank}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity onLongPress={() => deleteExpence(item.id)} style={[styles.cardInner, { backgroundColor: item.plus == 1 ? '#7aeb7a' : '#FF7F7F' }]}>
                            
                            <View style={styles.cardInnerLeft}>
                                <Text>{item.expence_name}</Text>
                                <Text>{item.expence_value}</Text>
                                <Text>{item.type}</Text>
                                <Text>{item.created_at}</Text>
                            </View>

                        </TouchableOpacity>
                    )
                }}
                estimatedItemSize={24}
                data={expences}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    cardInner: {
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 20,
        marginHorizontal: 15,
        marginBottom: 10
    },
    cardInnerLeft: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInnerRight: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardInnerRightButton: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputContainer: {
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 15,
        marginBottom: 10,
        backgroundColor: '#F9E2AF'
    },
    dropdownView: {
        width: '100%',
        border: 'none',
        paddingVertical: 10,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderWidth: 0
    },
    dropdownStyles: {
        backgroundColor: '#fff',
        border: 'none'
    },
    dropdownItemStyles: {
        paddingVertical: 10
    },
    formInput: {
        width: '100%',
        height: 45,
        textAlign: 'center',
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 0,
        borderColor: "gray"
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#98DED9',
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBox: {
        flexDirection: 'row',
        gap: 10
    },
    searchBoxDelete: {
        width: 45,
        height: 45,
        borderRadius: 10,
        backgroundColor: '#FF7F7F',
        alignItems: 'center',
        justifyContent: 'center'
    }
})