#!/usr/bin/env node

import fetch from 'node-fetch';

// Assign the result of muscles
const muscle_api_results = await fetch('https://wger.de/api/v2/muscle')
                          .then(res => res.json())
                          .then(json => json['results'] );


/**
 * This function recieves 
 * @param {*} muscle_name 
 * @returns the muscle_id of the specified muscle name 
 */
async function find_muscle_id(muscle_name) {   
    for (var i=0; i < muscle_api_results.length; i++) {
        if (muscle_api_results[i]['name_en'] === muscle_name) {
            var muscle_id = muscle_api_results[i]['id'];
        }
    }

    return muscle_id;
}


/**
 * This function receives
 * @param {*} muscle_id 
 * @returns the muscle_name of the specified muscle id
 */
async function find_muscle_name(muscle_id) {

    for (var i=0; i<muscle_api_results.length; i++) {
        if (muscle_api_results[i]['id'] === muscle_id) {
            var muscle_name = await muscle_api_results[i]['name_en'];
        }
    }
    return muscle_name;    
}

/**
 * This function receives
 * @param {*} muscle_id 
 * @returns A json list with three attributes: Exercise name, Description, the name of other muscles exercised from the corresponding workout
 */
async function print_exercises(muscle_id) {
   const exercise_result = await fetch('https://wger.de/api/v2/exercise?muscles='+ muscle_id)
                  .then(res => res.json())
                  .then(json => json['results'])
    var other_exercises_list = []
    const result_list = [];


    for (var i=0; i < exercise_result.length; i++) {
        let secondary_muscle_list = exercise_result[i]['muscles_secondary']
    

        if (secondary_muscle_list.length != 0) {
            for (var y=0; y < secondary_muscle_list.length; y++) {
                var item = secondary_muscle_list[y];
                var other_exercise_names = await find_muscle_name(item)

                if (other_exercise_names != ''){
                    other_exercises_list.push(other_exercise_names)                 
                }
            }
        }

        result_list.push({"exercise_name": exercise_result[i]['name'],
                          "description": exercise_result[i]['description'],
                          "other_muscles": other_exercises_list 
                        })

        other_exercises_list = [];
        
    }

    return result_list;
}

/**
 * The main method which collect all the information and redirect to the correct function to produce the end result
 * @returns 
 */
const main = async () => {
    const args = process.argv.slice(2);
    var user_param = args[0];
    var muscle_id = await find_muscle_id(user_param)
    var exercises = await print_exercises(muscle_id)

    console.log(exercises);

    return Promise.all([muscle_id,exercises])
}
export default main();
