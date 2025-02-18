# This theme explores the relationship between financial investment, creative choices, and audience reception, focusing on:

# The impact of budget and genre on revenue and ratings.

# Regional disparities in film production and profitability.

# 5. Dataset Modifications
# We have considered the following modifications for using the dataset:

# Focus on modern movie trends by removing entries before 1900 to filter movies to 20th/21st century:


# Extract time features like year, month and day of release from releaseDate

#  Remove homepage, overview, and tagline columns to streamline the dataset to the theme.
import pandas as pd 
df = pd.read_csv(r"movies_metadata.csv", low_memory=False)
# print(df)   #[45466 rows x 17 columns]-INITIAL TOTAL ROW

# PREWORK ON DATA

# print(df.nunique())
# print('\n')
# print(df.isnull().sum())
# print('\n')
# print((df.isnull().sum()/(len(df)))*100)    #percentage of missing values in each column


df = df.drop(columns=['adult', 'homepage', 'overview', 'poster_path', 'video', 'tagline'])  
df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')    #The errors='coerce' => NaN
cutoff_date = pd.Timestamp('1900-01-01')    # Define the cutoff date
df_date = df[df['release_date'] >= cutoff_date] # Filter the DataFrame
# df_nonfiltered = df[df['release_date'] <= cutoff_date] # Filter the DataFrame
# print(df_nonfiltered['release_date'])   #List of Removable values
df['budget'] = pd.to_numeric(df['budget'], errors='coerce')  
df['popularity'] = pd.to_numeric(df['popularity'], errors='coerce')  

# Include only released movies: by filtering status = "Released". This will Ensure our dashboard  reflects actual audience reception 
df_released = (df['status'] =="Released")
df_rumoured = df[df['status'] == "Rumored"]

# print(df.info())    
print("/n")
# print(df['status'].isnull().sum())    
print(df_released)    
print("/n")
print(df_rumoured.info())    
print("/n")
print(df_rumoured)    
# print((df['status']=="Rumored").sum())    


# print(df['release_date'].isna().sum())    
# print(df['budget'].isnull().sum())    
# print(df['popularity'].isnull().sum())    
# # print(df['release_date'].isna().sum())    
# rows_with_nan_date = df[df['release_date'].isna()]  #[90 rows x 18 columns]
# rows_with_nan_budget = df[df['budget'].isna()]  #[3 rows x 18 columns]
# rows_with_nan_pop = df[df['popularity'].isna()] #[6 rows x 18 columns]
# # print(rows_with_nan_budget)
# # print(rows_with_nan_date)
# # print(rows_with_nan_pop)




# 0)belongstoGroup WORK
# 1)budget WORK

df['budget'] = pd.to_numeric(df['budget'], errors='coerce')  
df_posbudget = df[df['budget'] > 0]          #ONLY 8890 available >0
# print(df_posbudget['budget'])  #ONLY 8890 available >0

# 2)genre WORK
# 3)id WORK
# 4)imdb_id WORK
# 5)orginal_language WORK
# 6)orginal_title WORK
# 7)popularity WORK
# 8)production_companies WORK
# 9)production_countries WORK
# 10)release_date WORK
# 11)revenue WORK
# 12)runtime WORK
# 13)spoken_languages WORK
# 14)title WORK
# 15)vote_average WORK
# 16)vote_count WORK


# WORK_INFO

# print(df.info()) 
# print('/n')
# # print(df.describe()) 
# print(df_date.describe()) 
# print('/n')
# print(df.head()) 
# print(df.tail()) 










# import matplotlib.pyplot as plt
# df.hist(figsize=(10, 8), bins=30)
# plt.show()


# import seaborn as sns
# plt.figure(figsize=(10, 6))
# sns.boxplot(data=df)

# sns.heatmap(df.isnull(), cmap="viridis", cbar=False)
# print(df.isnull().sum())  # Count missing values
# df = df.dropna()  # Remove missing values (or fill using df.fillna(value))


# Trends in Movie Success: How Budget, Genre, and Runtime Influence Revenue and Audience Ratings Over Time
