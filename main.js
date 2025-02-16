import pandas as pd 
df = pd.read_csv(r"movies_metadata.csv", low_memory=False)
# print(df)   #[45466 rows x 17 columns]-INITIAL TOTAL ROW
df = df.drop(columns=['adult', 'homepage', 'overview', 'poster_path', 'video', 'status', 'tagline'])  
df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce')    #The errors='coerce' => NaN
cutoff_date = pd.Timestamp('1900-01-01')    # Define the cutoff date
df_date = df[df['release_date'] >= cutoff_date] # Filter the DataFrame
# df_nonfiltered = df[df['release_date'] <= cutoff_date] # Filter the DataFrame
# print(df_nonfiltered['release_date'])   #List of Removable values
df['budget'] = pd.to_numeric(df['budget'], errors='coerce')  
df['popularity'] = pd.to_numeric(df['popularity'], errors='coerce')  


# DATE UPDATE


print(df['release_date'].isna().sum())    
print(df['budget'].isnull().sum())    
print(df['popularity'].isnull().sum())    
# print(df['release_date'].isna().sum())    
rows_with_nan_date = df[df['release_date'].isna()]  #[90 rows x 17 columns]
rows_with_nan_budget = df[df['budget'].isna()]  #[3 rows x 17 columns]
rows_with_nan_pop = df[df['popularity'].isna()] #[6 rows x 17 columns]
# print(rows_with_nan_budget)
# print(rows_with_nan_date)
# print(rows_with_nan_pop)



# BUDGET WORK

df['budget'] = pd.to_numeric(df['budget'], errors='coerce')  
df_posbudget = df[df['budget'] > 0]          #ONLY 8890 available >0
# print("df_posbudget") 
# print(df_posbudget['budget'])  #ONLY 8890 available >0











# print(df_filtered.info())  #17 categories expected
# print("\n")
# print(df_filtered)  # Data types, missing values
# print(df_filtered['release_date'])  # Data types, missing values

# print(df.describe())  # Statistical summary
# print(df.head())  # First few rows
# print(df.tail())  # Last few rows
# print(df.nunique())
# print(df.isnull().sum())
# print((df.isnull().sum()/(len(df)))*100)

# import matplotlib.pyplot as plt
# df.hist(figsize=(10, 8), bins=30)
# plt.show()


# import seaborn as sns
# plt.figure(figsize=(10, 6))
# sns.boxplot(data=df)

# sns.heatmap(df.isnull(), cmap="viridis", cbar=False)
# print(df.isnull().sum())  # Count missing values
# df = df.dropna()  # Remove missing values (or fill using df.fillna(value))


