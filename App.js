/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Home from './src/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loadBudget} from './src/actions/budget';

const App = () => {
  const credits = useSelector(state => state.budget.credits);
  const debits = useSelector(state => state.budget.debits);
  const dispatch = useDispatch();

  const updateStorage = useCallback(async () => {
    if (credits?.length || debits?.length) {
      AsyncStorage.setItem(
        'budget',
        JSON.stringify({credits: credits, debits: debits}),
      );
    } else {
      const budget = await AsyncStorage.getItem('budget');
      if (budget) {
        const budgetData = JSON.parse(budget);
        function removeOld(list) {
          const month = new Date().getMonth();
          return list
            .filter(item => {
              return (
                item.isMonthly ||
                new Date(parseInt(item.createdAt)).getMonth() === month
              );
            })
            .map(item => {
              if (
                (item?.used || item?.used === 0) &&
                new Date(parseInt(item.createdAt)).getMonth() !== month
              ) {
                console.log(new Date(parseInt(item.createdAt)).getMonth());
                console.log(month);
                return {...item, used: 0, createdAt: Date.now()};
              }
              return item;
            });
        }
        const newBudget = {
          debits: removeOld(budgetData.debits),
          credits: removeOld(budgetData.credits),
        };
        dispatch(loadBudget(newBudget));
        AsyncStorage.setItem('budget', JSON.stringify(newBudget));
      }
    }
  }, [credits, debits]);

  useEffect(() => {
    updateStorage();
  }, [credits, debits]);

  return <Home />;
};

export default App;
