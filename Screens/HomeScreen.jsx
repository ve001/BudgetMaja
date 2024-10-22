import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as SQLite from 'expo-sqlite/legacy';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function HomeScreen({ navigation }) {
  const db = SQLite.openDatabase('budget.db')

  const [isLoading, setIsLoading] = useState(true)
  const [expences, setExpences] = useState([])

  const [minus, setMinus] = useState(0)
  const [plus, setPlus] = useState(0)
  const [sum, setSum] = useState(0)

  const [cashMinus, setCashMinus] = useState(0)
  const [cashPlus, setCashPlus] = useState(0)
  const [cashSum, setCashSum] = useState(0)

  const [cardMinus, setCardMinus] = useState(0)
  const [cardPlus, setCardPlus] = useState(0)
  const [cardSum, setCardSum] = useState(0)

  useFocusEffect(
    useCallback(() => {
      db.transaction(tx => {
        tx.executeSql("SELECT * FROM expences ORDER BY id DESC", null,
          (txObj, resultSet) => setExpences(resultSet.rows._array),
          (txObj, error) => console.log(error)
        )
      })

      calculateSum()
      setIsLoading(false)
    }, [])
  )

  useEffect(() => {
    db.transaction(tx => {
      //tx.executeSql('DROP TABLE expences')
      tx.executeSql('CREATE TABLE IF NOT EXISTS expences (id INTEGER PRIMARY KEY AUTOINCREMENT, plus INT NOT NULL, type TEXT NOT NULL, expence_name TEXT NOT NULL, expence_value FLOAT NOT NULL, created_at DATE NOT NULL DEFAULT CURRENT_DATE)')
    })

    db.transaction(tx => {
      tx.executeSql("SELECT * FROM expences ORDER BY id DESC", null,
        (txObj, resultSet) => setExpences(resultSet.rows._array),
        (txObj, error) => console.log(error)
      )
    })

    calculateSum()
    setIsLoading(false)
  }, [])

  const calculateSum = () => {
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM expences ORDER BY id DESC", null,
        (txObj, resultSet) => {
          let rows = resultSet.rows._array

          let calcPlusCash = 0
          let calcMinusCash = 0

          let calcPlusCard = 0
          let calcMinusCard = 0

          let calcPlus = 0
          let calcMinus = 0
          rows.forEach(element => {
            if (element.plus == 1) calcPlus += element.expence_value
            else calcMinus += element.expence_value

            if (element.type == 'Card' && element.plus == 1) calcPlusCard += element.expence_value
            if (element.type == 'Card' && element.plus == 0) calcMinusCard += element.expence_value

            if (element.type == 'Cash' && element.plus == 1) calcPlusCash += element.expence_value
            if (element.type == 'Cash' && element.plus == 0) calcMinusCash += element.expence_value
          });
          setPlus(calcPlus)
          setMinus(calcMinus)
          setSum(calcPlus - calcMinus)

          setCashMinus(calcMinusCash)
          setCashPlus(calcPlusCash)

          setCardMinus(calcMinusCard)
          setCardPlus(calcPlusCard)

          setCashSum(calcPlusCash - calcMinusCash)
          setCardSum(calcPlusCard - calcMinusCard)
        },
        (txObj, error) => console.log(error)
      )
    })
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      <View style={styles.addButtonsView}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonMinus} onPress={() => navigation.navigate("Minus")}>
            <Text style={styles.buttonAddText}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.buttonPlus} onPress={() => navigation.navigate("Plus")}>
            <Text style={styles.buttonAddText}>+</Text>
          </TouchableOpacity>
        </View>

      </View>

      <View style={styles.detailsButtonContainer}>
        <View style={styles.detailsButtonBox}>
          <TouchableOpacity style={styles.detailsButton} onPress={() => navigation.navigate('Details')}>
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusInfo}>
        <View style={styles.statusInfoWallet}>
          <View style={styles.statusInfoWalletContainer}>
            <View style={styles.statusInfoWalletTextContainer}>
              <Text style={styles.statusInfoWalletText}><Entypo name="wallet" size={50} color="black" /> {cashSum} RSD</Text>
              <Text style={styles.statusInfoWalletText}><FontAwesome name="bank" size={50} color="black" /> {cardSum} RSD</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusInfoPlus}>
          <View style={styles.statusInfoPlusContainer}>

            <View style={styles.statusInfoPlusContainerLeft}>
              <Text style={styles.statusInfoPlusText}>
                <Entypo name="wallet" size={20} color="black" /> +{cashPlus}
              </Text>
            </View>

            <View style={styles.statusInfoMinusContainerLeft}>
              <Text style={styles.statusInfoPlusText}>
              -{cashMinus}
              </Text>
            </View>

          </View>
        </View>

        <View style={styles.statusInfoMinus}>
          <View style={styles.statusInfoMinusContainer}>

            <View style={styles.statusInfoPlusContainerLeft}>
              <Text style={styles.statusInfoMinusText}>
              <FontAwesome name="bank" size={20} color="black" /> +{cardPlus}
              </Text>
            </View>

            <View style={styles.statusInfoMinusContainerRight}>
              <Text style={styles.statusInfoMinusText}>
                -{cardMinus}
              </Text>
            </View>

          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    //justifyContent: 'center',
  },
  addButtonsView: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },

  buttonContainer: {
    flex: 1,
    //marginHorizontal: 7.5,
  },
  buttonMinus: {
    backgroundColor: '#DF4661',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  buttonPlus: {
    backgroundColor: '#7aeb7a',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  buttonAddText: {
    fontSize: 30,
    margin: 0,
    padding: 0,
    opacity: 0.4
  },
  detailsButtonContainer: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  detailsButtonBox: {
    flex: 1,
  },
  detailsButton: {
    backgroundColor: 'lightblue',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  detailsButtonText: {
    fontSize: 18,
    opacity: 0.6
  },
  statusInfo: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  statusInfoWallet: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    flex: 1
  },
  statusInfoWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  statusInfoWalletTextContainer: {
    fontSize: 25,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#E8B86D',
    borderRadius: 10,
    paddingVertical: 30,
    height: '100%',
    width: '100%',
  },
  statusInfoWalletText: {
    fontSize: 30,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: '#E8B86D',
    borderRadius: 10,
    paddingVertical: 30,
    width: '100%',
    opacity: 0.7
  },

  statusInfoPlus: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  statusInfoPlusContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#7aeb7a',
    borderRadius: 10
  },

  statusInfoPlusContainerLeft: {
    flex: 1,
    height: 50,
    backgroundColor: '#7aeb7a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },

  statusInfoPlusContainerRight: {
    flex: 1,
    height: 50,
    backgroundColor: '#7aeb7a',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },

  statusInfoPlusText: {
    fontSize: 17,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 10,
    paddingVertical: 0,
    color: 'black',
    opacity: 0.55
  },

  statusInfoMinus: {
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  statusInfoMinusContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#7aeb7a',
    borderRadius: 10
  },
  statusInfoMinusContainerLeft: {
    height: 50,
    backgroundColor: '#D95F59',
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: 'fit-content',
    paddingHorizontal: 25
  },

  statusInfoMinusContainerRight: {
    height: 50,
    backgroundColor: '#D95F59',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: 'fit-content',
    paddingHorizontal: 25,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  statusInfoMinusText: {
    fontSize: 17,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderRadius: 10,
    paddingVertical: 0,
    color: 'black',
    opacity: 0.55,
  }
});
